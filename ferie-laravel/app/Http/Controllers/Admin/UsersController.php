<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) ($request->get('year') ?? now()->year);

        $users = User::where('active', true)
            ->where('role', '!=', 'admin')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (User $u) => $this->mapUser($u, $year));

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'year' => $year,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:user,admin',
        ], [
            'firstName.required' => 'Inserisci il nome.',
            'lastName.required' => 'Inserisci il cognome.',
            'email.required' => 'Inserisci l\'email.',
            'email.email' => 'Email non valida.',
            'email.unique' => 'Email già in uso.',
            'password.required' => 'Inserisci la password.',
            'password.confirmed' => 'Le password non coincidono.',
        ]);

        $name = trim($validated['firstName'] . ' ' . $validated['lastName']) ?: $validated['email'];

        User::create([
            'name' => $name,
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'active' => true,
        ]);

        return back()->with('status', 'Utente creato.');
    }

    public function updateBalance(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'allocated_days' => 'required|integer|min:0|max:365',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        LeaveBalance::updateOrCreate(
            [
                'user_id' => $user->id,
                'year' => $validated['year'],
            ],
            ['allocated_days' => $validated['allocated_days']]
        );

        return back()->with('status', 'Budget aggiornato.');
    }

    private function mapUser(User $u, int $year): array
    {
        $balance = LeaveBalance::where('user_id', $u->id)
            ->where('year', $year)
            ->first();

        return [
            'id' => (string) $u->id,
            'firstName' => $u->first_name ?? '',
            'lastName' => $u->last_name ?? '',
            'email' => $u->email ?? '',
            'role' => $u->role ?? 'user',
            'allocatedDays' => $balance?->allocated_days ?? 0,
            'usedDays' => $balance?->used_days ?? 0,
            'remaining' => $balance ? ($balance->allocated_days - $balance->used_days) : 0,
        ];
    }
}
