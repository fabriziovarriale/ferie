<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', \App\Http\Controllers\DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/calendar', \App\Http\Controllers\CalendarController::class)
    ->middleware(['auth', 'verified'])
    ->name('calendar');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard/request', fn () => redirect()->route('dashboard'))
        ->name('leave-request.create');
    Route::post('/dashboard/request', [\App\Http\Controllers\LeaveRequestController::class, 'store'])
        ->name('leave-request.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [\App\Http\Controllers\Admin\UsersController::class, 'index'])->name('users.index');
    Route::post('/users', [\App\Http\Controllers\Admin\UsersController::class, 'store'])->name('users.store');
    Route::patch('/users/{user}/balance', [\App\Http\Controllers\Admin\UsersController::class, 'updateBalance'])->name('users.balance');
    Route::patch('/requests/{leaveRequest}/approve', [\App\Http\Controllers\Admin\LeaveRequestController::class, 'approve'])->name('requests.approve');
    Route::patch('/requests/{leaveRequest}/reject', [\App\Http\Controllers\Admin\LeaveRequestController::class, 'reject'])->name('requests.reject');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
