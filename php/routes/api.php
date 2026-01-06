<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Root endpoint
Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to Library Manager API',
        'status' => 'ready'
    ]);
});

// Health check
Route::get('/health/db', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'database' => 'connected',
            'status' => 'healthy'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'database' => 'disconnected',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Books routes
Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);
    Route::get('/{id}', [BookController::class, 'show']);
    Route::post('/', [BookController::class, 'store']);
    Route::put('/{id}', [BookController::class, 'update']);
    Route::delete('/{id}', [BookController::class, 'destroy']);
    Route::post('/upload-image', [BookController::class, 'uploadImage']);
});

// Members routes
Route::prefix('members')->group(function () {
    Route::get('/', [MemberController::class, 'index']);
    Route::get('/{id}', [MemberController::class, 'show']);
    Route::post('/', [MemberController::class, 'store']);
    Route::put('/{id}', [MemberController::class, 'update']);
});

// Loans routes
Route::prefix('loans')->group(function () {
    Route::get('/', [LoanController::class, 'index']);
    Route::post('/borrow', [LoanController::class, 'borrow']);
    Route::post('/return/{id}', [LoanController::class, 'return']);
    Route::post('/fines/{fineId}/pay', [LoanController::class, 'payFine']);
    Route::get('/check-access', [LoanController::class, 'checkAccess']);
});

// Reservations routes
Route::prefix('reservations')->group(function () {
    Route::get('/', [ReservationController::class, 'index']);
    Route::post('/reserve', [ReservationController::class, 'store']);
    Route::delete('/{id}', [ReservationController::class, 'destroy']);
});

// Analytics routes
Route::prefix('analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/top-books', [AnalyticsController::class, 'topBooks']);
    Route::get('/overdue-list', [AnalyticsController::class, 'overdueList']);
});

