<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $shared = [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
        ];

        if ($user && $user->isAdmin()) {
            $employees = \App\Models\User::where('active', true)
                ->where('role', '!=', 'admin')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
            $shared['adminEmployees'] = $employees->map(fn ($u) => [
                'id' => (string) $u->id,
                'label' => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')) ?: $u->email,
            ])->values()->all();
            $balances = \App\Models\LeaveBalance::whereIn('user_id', $employees->pluck('id'))
                ->where('year', now()->year)
                ->get()
                ->keyBy('user_id');
            $shared['adminEmployeesWithBalances'] = $employees->mapWithKeys(fn ($u) => [
                (string) $u->id => [
                    'total' => $balances->get($u->id)?->allocated_days ?? 0,
                    'used' => $balances->get($u->id)?->used_days ?? 0,
                    'remaining' => ($balances->get($u->id)?->allocated_days ?? 0) - ($balances->get($u->id)?->used_days ?? 0),
                ],
            ])->all();
        } else {
            $shared['adminEmployees'] = [];
            $shared['adminEmployeesWithBalances'] = [];
        }

        return $shared;
    }
}
