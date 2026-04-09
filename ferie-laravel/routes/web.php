<?php

use App\Http\Controllers\Admin\CompanyHolidaysController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard/request', fn () => redirect()->route('dashboard'))
        ->name('leave-request.create');
    Route::post('/dashboard/request', [LeaveRequestController::class, 'store'])
        ->name('leave-request.store');
    Route::patch('/dashboard/request/{leaveRequest}/cancel', [LeaveRequestController::class, 'cancel'])
        ->name('leave-request.cancel');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [UsersController::class, 'index'])->name('users.index');
    Route::post('/users', [UsersController::class, 'store'])->name('users.store');
    Route::patch('/users/{user}/balance', [UsersController::class, 'updateBalance'])->name('users.balance');
    Route::delete('/users/{user}', [UsersController::class, 'destroy'])->name('users.destroy');
    Route::patch('/requests/{leaveRequest}/approve', [App\Http\Controllers\Admin\LeaveRequestController::class, 'approve'])->name('requests.approve');
    Route::patch('/requests/{leaveRequest}/reject', [App\Http\Controllers\Admin\LeaveRequestController::class, 'reject'])->name('requests.reject');
    Route::patch('/requests/{leaveRequest}/revoke', [App\Http\Controllers\Admin\LeaveRequestController::class, 'revoke'])->name('requests.revoke');
    Route::delete('/requests/{leaveRequest}', [App\Http\Controllers\Admin\LeaveRequestController::class, 'destroy'])->name('requests.destroy');

    Route::get('/holidays', [CompanyHolidaysController::class, 'index'])->name('holidays.index');
    Route::post('/holidays', [CompanyHolidaysController::class, 'store'])->name('holidays.store');
    Route::delete('/holidays/{id}', [CompanyHolidaysController::class, 'destroy'])->name('holidays.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
