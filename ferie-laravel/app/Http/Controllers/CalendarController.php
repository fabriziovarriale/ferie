<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
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

        $balance = LeaveBalance::where('user_id', $user->id)
            ->where('year', $year)
            ->first();

        $employeeBalance = $balance ? [
            'total' => $balance->allocated_days,
            'used' => $balance->used_days,
            'remaining' => $balance->allocated_days - $balance->used_days,
        ] : null;

        $data = [
            'leaveTypes' => $leaveTypes,
            'employeeBalance' => $employeeBalance,
            'requests' => [],
            'isAdmin' => $user->isAdmin(),
        ];

        if ($user->isAdmin()) {
            $employees = User::where('active', true)
                ->where('role', '!=', 'admin')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();

            $data['employees'] = $employees->map(fn ($u) => [
                'id' => (string) $u->id,
                'label' => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')) ?: $u->email,
            ])->values()->all();

            $balances = LeaveBalance::whereIn('user_id', $employees->pluck('id'))
                ->where('year', $year)
                ->get()
                ->keyBy('user_id');

            $data['employeesWithBalances'] = $employees->mapWithKeys(fn ($u) => [
                (string) $u->id => $this->mapBalance($balances->get($u->id)),
            ])->all();
        }

        $query = LeaveRequest::with(['user', 'leaveType'])
            ->whereIn('status', ['PENDING', 'APPROVED']);

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $data['requests'] = $query->orderBy('start_date')
            ->get()
            ->map(fn ($r) => [
                'id' => (string) $r->id,
                'userFullName' => $r->user ? trim($r->user->first_name . ' ' . $r->user->last_name) : 'Dipendente',
                'leaveType' => $r->leave_type_code,
                'startDate' => $r->start_date->format('Y-m-d'),
                'endDate' => $r->end_date->format('Y-m-d'),
                'requestedUnits' => $r->requested_units,
                'status' => $r->status,
            ]);

        return Inertia::render('Calendar', $data);
    }

    private function mapBalance(?LeaveBalance $b): array
    {
        if (! $b) {
            return ['total' => 0, 'used' => 0, 'remaining' => 0];
        }

        return [
            'total' => $b->allocated_days,
            'used' => $b->used_days,
            'remaining' => $b->allocated_days - $b->used_days,
        ];
    }
}
