<?php

namespace App\Http\Controllers;

use App\Helpers\WorkingDays;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'leaveType' => 'required|string|in:FERIE,MALATTIA,PERMESSO,ROL',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
            'requestedUnits' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:1000',
        ];

        if ($request->user()->isAdmin()) {
            $rules['userId'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules, [
            'startDate.required' => 'Inserisci data inizio.',
            'startDate.date' => 'Data inizio non valida.',
            'endDate.required' => 'Inserisci data fine.',
            'endDate.date' => 'Data fine non valida.',
            'endDate.after_or_equal' => 'Data fine deve essere ≥ data inizio.',
            'leaveType.required' => 'Seleziona tipo assenza.',
            'leaveType.in' => 'Tipo assenza non valido.',
            'requestedUnits.integer' => 'Ore non valide.',
            'requestedUnits.min' => 'Inserisci almeno 1 ora.',
            'note.max' => 'Note troppo lunghe.',
            'userId.required' => 'Seleziona il dipendente.',
            'userId.exists' => 'Dipendente non valido.',
        ]);

        $targetUserId = $request->user()->isAdmin()
            ? (int) $validated['userId']
            : $request->user()->id;

        $leaveType = LeaveType::where('code', $validated['leaveType'])->first();
        if (! $leaveType) {
            return back()->withErrors(['leaveType' => 'Tipo non valido.']);
        }

        $requestedUnits = (int) ($validated['requestedUnits'] ?? 0);

        if ($leaveType->unit === 'days') {
            $days = WorkingDays::between($validated['startDate'], $validated['endDate']);
            $requestedUnits = $days;

            if ($leaveType->deducts_balance) {
                $balance = LeaveBalance::where('user_id', $targetUserId)
                    ->where('year', now()->year)
                    ->first();

                if (! $balance) {
                    return back()->withErrors([
                        'startDate' => 'Budget ferie non impostato. Contatta l\'admin.',
                    ]);
                }

                $remaining = $balance->allocated_days - $balance->used_days;

                if ($days > $remaining) {
                    return back()->withErrors([
                        'startDate' => "Giorni richiesti ({$days}) > residui ({$remaining}).",
                    ]);
                }
            }
        } elseif ($leaveType->unit === 'hours' && $requestedUnits < 1) {
            return back()->withErrors(['requestedUnits' => 'Minimo 1 ora.']);
        }

        LeaveRequest::create([
            'user_id' => $targetUserId,
            'leave_type_code' => $validated['leaveType'],
            'start_date' => $validated['startDate'],
            'end_date' => $validated['endDate'],
            'requested_units' => $requestedUnits,
            'status' => 'PENDING',
            'note_user' => $validated['note'] ?? null,
        ]);

        return redirect()->route('dashboard')->with('status', 'Richiesta inviata con successo.');
    }
}
