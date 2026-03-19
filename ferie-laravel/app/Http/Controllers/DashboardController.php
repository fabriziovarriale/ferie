<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\Request;
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
            ->map(fn ($r) => $this->mapRequest($r, $user->first_name . ' ' . $user->last_name));

        $balance = LeaveBalance::where('user_id', $user->id)
            ->where('year', $year)
            ->first();

        $employeeBalance = $balance ? [
            'total' => $balance->allocated_days,
            'used' => $balance->used_days,
            'remaining' => $balance->allocated_days - $balance->used_days,
        ] : null;

        $calendarRequests = LeaveRequest::with(['user', 'leaveType'])
            ->whereIn('status', ['PENDING', 'APPROVED'])
            ->when(! $user->isAdmin(), fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('start_date')
            ->get()
            ->map(fn ($r) => [
                'id' => (string) $r->id,
                'startDate' => $r->start_date->format('Y-m-d'),
                'endDate' => $r->end_date->format('Y-m-d'),
            ]);

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
            'calendarRequests' => $calendarRequests,
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
                'label' => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')) ?: $u->email,
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
                ->map(fn ($r) => $this->mapRequest($r, $r->user->first_name . ' ' . $r->user->last_name));

            $approvedRequests = LeaveRequest::where('status', 'APPROVED')
                ->with(['user', 'leaveType'])
                ->orderByDesc('created_at')
                ->limit(200)
                ->get()
                ->map(fn ($r) => $this->mapRequest($r, $r->user->first_name . ' ' . $r->user->last_name));

            $rejectedRequests = LeaveRequest::where('status', 'REJECTED')
                ->with(['user', 'leaveType'])
                ->orderByDesc('created_at')
                ->limit(200)
                ->get()
                ->map(fn ($r) => $this->mapRequest($r, $r->user->first_name . ' ' . $r->user->last_name));

            $data['employees'] = $employees;
            $data['employeesWithBalances'] = $employeesWithBalances;
            $data['pendingRequests'] = $pendingRequests;
            $data['approvedRequests'] = $approvedRequests;
            $data['rejectedRequests'] = $rejectedRequests;
        }

        return Inertia::render('Dashboard', $data);
    }

    private function mapRequest(LeaveRequest $r, string $fallbackName): array
    {
        $name = $r->user ? trim($r->user->first_name . ' ' . $r->user->last_name) : $fallbackName;

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
