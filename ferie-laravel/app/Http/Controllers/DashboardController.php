<?php

namespace App\Http\Controllers;

use App\Helpers\ItalianNationalHolidays;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $year = now()->year;

        $leaveTypes = LeaveType::where('active', true)
            ->orderBy('code')
            ->get()
            ->map(fn ($lt) => [
                'code' => $lt->code,
                'label' => $lt->description,
                'deductsBalance' => $lt->deducts_balance,
                'unit' => $lt->unit,
            ]);

        $employeeRequests = LeaveRequest::where('user_id', $user->id)
            ->with('leaveType')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($r) => $this->mapRequest($r, $user->first_name.' '.$user->last_name));

        $balance = LeaveBalance::where('user_id', $user->id)
            ->where('year', $year)
            ->first();

        $usedDays = (int) LeaveRequest::sumDeductibleApprovedDaysByUserForYear($year)
            ->get($user->id, 0);

        $employeeBalance = $balance ? [
            'total' => $balance->allocated_days,
            'used' => $usedDays,
            'remaining' => max(0, $balance->allocated_days - $usedDays),
        ] : null;

        $calendarFrom = now()->startOfYear()->subYear();
        $calendarTo = now()->endOfYear()->addYear();

        $rowsToInsert = [];
        for ($yearCursor = $calendarFrom->year; $yearCursor <= $calendarTo->year; $yearCursor++) {
            foreach (ItalianNationalHolidays::forYear($yearCursor) as $holiday) {
                $rowsToInsert[] = [
                    'date' => $holiday['date'],
                    'description' => $holiday['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('company_holidays')->insertOrIgnore($rowsToInsert);

        $approvedLeaveCalendar = LeaveRequest::query()
            ->where('status', 'APPROVED')
            ->where('start_date', '<=', $calendarTo)
            ->where('end_date', '>=', $calendarFrom)
            ->with(['user', 'leaveType'])
            ->orderBy('start_date')
            ->limit(500)
            ->get()
            ->map(fn ($r) => [
                'id' => (string) $r->id,
                'userFullName' => $r->user
                    ? trim(($r->user->first_name ?? '').' '.($r->user->last_name ?? '')) ?: 'Dipendente'
                    : 'Dipendente',
                'leaveType' => $r->leaveType?->description ?? $r->leave_type_code,
                'startDate' => $r->start_date->format('Y-m-d'),
                'endDate' => $r->end_date->format('Y-m-d'),
            ])
            ->values()
            ->all();

        $companyHolidays = DB::table('company_holidays')
            ->whereBetween('date', [$calendarFrom->toDateString(), $calendarTo->toDateString()])
            ->pluck('date')
            ->values()
            ->all();

        $data = [
            'user' => [
                'id' => (string) $user->id,
                'firstName' => $user->first_name ?? '',
                'lastName' => $user->last_name ?? '',
                'role' => $user->role ?? 'user',
            ],
            'leaveTypes' => $leaveTypes,
            'employeeBalance' => $employeeBalance,
            'employeeRequests' => $employeeRequests,
            'approvedLeaveCalendar' => $approvedLeaveCalendar,
            'companyHolidays' => $companyHolidays,
            'isAdmin' => $user->isAdmin(),
        ];

        if ($user->isAdmin()) {
            $employeesCollection = User::where('active', true)
                ->where('role', '!=', 'admin')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();

            $employees = $employeesCollection->map(fn ($u) => [
                'id' => (string) $u->id,
                'label' => trim(($u->first_name ?? '').' '.($u->last_name ?? '')) ?: $u->email,
                'firstName' => $u->first_name ?? '',
                'lastName' => $u->last_name ?? '',
                'role' => $u->role ?? 'user',
            ])->values()->all();

            $balances = LeaveBalance::whereIn('user_id', $employeesCollection->pluck('id'))
                ->where('year', $year)
                ->get()
                ->keyBy('user_id');

            $employeesWithBalances = $employeesCollection->mapWithKeys(fn ($u) => [
                (string) $u->id => [
                    'total' => $balances->get($u->id)?->allocated_days ?? 0,
                    'used' => $balances->get($u->id)?->used_days ?? 0,
                    'remaining' => ($balances->get($u->id)?->allocated_days ?? 0) - ($balances->get($u->id)?->used_days ?? 0),
                ],
            ])->all();

            $pendingRequests = LeaveRequest::where('status', 'PENDING')
                ->with(['user', 'leaveType'])
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($r) {
                    $mapped = $this->mapRequest($r, $r->user->first_name.' '.$r->user->last_name);
                    $mapped['roleConflictWarning'] = $this->checkJobRoleOverlap($r);
                    return $mapped;
                });

            $perPage = 30;
            $approvedPage = (int) ($request->get('approved_page', 1));
            $rejectedPage = (int) ($request->get('rejected_page', 1));

            $approvedPaginator = LeaveRequest::where('status', 'APPROVED')
                ->with(['user', 'leaveType'])
                ->orderByDesc('created_at')
                ->paginate($perPage, ['*'], 'approved_page', $approvedPage);

            $rejectedPaginator = LeaveRequest::where('status', 'REJECTED')
                ->with(['user', 'leaveType'])
                ->orderByDesc('created_at')
                ->paginate($perPage, ['*'], 'rejected_page', $rejectedPage);

            $approvedRequests = $approvedPaginator->getCollection()
                ->map(fn ($r) => $this->mapRequest($r, $r->user->first_name.' '.$r->user->last_name));

            $rejectedRequests = $rejectedPaginator->getCollection()
                ->map(fn ($r) => $this->mapRequest($r, $r->user->first_name.' '.$r->user->last_name));

            $data['employees'] = $employees;
            $data['employeesWithBalances'] = $employeesWithBalances;
            $data['pendingRequests'] = $pendingRequests;
            $data['approvedRequests'] = $approvedRequests;
            $data['approvedMeta'] = [
                'currentPage' => $approvedPaginator->currentPage(),
                'lastPage' => $approvedPaginator->lastPage(),
                'total' => $approvedPaginator->total(),
            ];
            $data['rejectedRequests'] = $rejectedRequests;
            $data['rejectedMeta'] = [
                'currentPage' => $rejectedPaginator->currentPage(),
                'lastPage' => $rejectedPaginator->lastPage(),
                'total' => $rejectedPaginator->total(),
            ];
        }

        return Inertia::render('Dashboard', $data);
    }

    private function checkJobRoleOverlap(LeaveRequest $request): ?string
    {
        $user = $request->user;

        if (! $user || ! $user->job_role) {
            return null;
        }

        $conflict = LeaveRequest::query()
            ->where('status', 'APPROVED')
            ->where('user_id', '!=', $user->id)
            ->where('start_date', '<=', $request->end_date)
            ->where('end_date', '>=', $request->start_date)
            ->whereHas('user', fn ($q) => $q->where('job_role', $user->job_role)->where('active', true))
            ->with('user')
            ->first();

        if (! $conflict) {
            return null;
        }

        $colName = trim(($conflict->user->first_name ?? '').' '.($conflict->user->last_name ?? ''))
            ?: $conflict->user->email;

        return "un altro {$user->job_role} ({$colName}) è già in ferie nel periodo selezionato.";
    }

    private function mapRequest(LeaveRequest $r, string $fallbackName): array
    {
        $name = $r->user ? trim($r->user->first_name.' '.$r->user->last_name) : $fallbackName;

        return [
            'id' => (string) $r->id,
            'userFullName' => $name ?: 'Dipendente',
            'leaveType' => $r->leave_type_code,
            'startDate' => $r->start_date->format('Y-m-d'),
            'endDate' => $r->end_date->format('Y-m-d'),
            'requestedUnits' => $r->requested_units,
            'status' => $r->status,
            'noteUser' => $r->note_user,
            'noteAdmin' => $r->note_admin,
            'createdAt' => $r->created_at->toIso8601String(),
        ];
    }
}
