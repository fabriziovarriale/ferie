<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CompanyHolidaysController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) ($request->get('year') ?? now()->year);

        $holidays = DB::table('company_holidays')
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get()
            ->map(fn ($h) => [
                'id' => $h->id,
                'date' => $h->date,
                'description' => $h->description,
            ]);

        return Inertia::render('Admin/Holidays', [
            'holidays' => $holidays,
            'year' => $year,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ], [
            'date.required' => 'Inserisci la data.',
            'date.date' => 'Data non valida.',
        ]);

        $exists = DB::table('company_holidays')->where('date', $validated['date'])->exists();
        if ($exists) {
            return back()->withErrors(['date' => 'Questa data è già presente.']);
        }

        DB::table('company_holidays')->insert([
            'date' => $validated['date'],
            'description' => $validated['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('status', 'Festività aggiunta.');
    }

    public function destroy(int $id): RedirectResponse
    {
        DB::table('company_holidays')->where('id', $id)->delete();

        return back()->with('status', 'Festività rimossa.');
    }
}
