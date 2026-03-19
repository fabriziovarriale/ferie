<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function approve(LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->load('leaveType');

        if ($leaveRequest->status !== 'PENDING') {
            return back()->with('status', 'Richiesta già elaborata.');
        }

        $leaveRequest->update(['status' => 'APPROVED']);

        $leaveType = $leaveRequest->leaveType;
        if ($leaveType && $leaveType->deducts_balance && $leaveType->unit === 'days') {
            $year = $leaveRequest->start_date->year;
            $balance = LeaveBalance::firstOrCreate(
                ['user_id' => $leaveRequest->user_id, 'year' => $year],
                ['allocated_days' => 0, 'used_days' => 0]
            );
            $balance->increment('used_days', $leaveRequest->requested_units);
        }

        return back()->with('status', 'Richiesta approvata.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        if ($leaveRequest->status !== 'PENDING') {
            return back()->with('status', 'Richiesta già elaborata.');
        }

        $validated = $request->validate([
            'note_admin' => 'nullable|string|max:1000',
        ]);

        $leaveRequest->update([
            'status' => 'REJECTED',
            'note_admin' => $validated['note_admin'] ?? null,
        ]);

        return back()->with('status', 'Richiesta rifiutata.');
    }
}
