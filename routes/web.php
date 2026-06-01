<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoiFinanceController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\MarcheController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('api')->withoutMiddleware([
    Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
])->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Dashboard
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);

        // Marches
        Route::get('marches', [MarcheController::class, 'index']);
        Route::post('marches', [MarcheController::class, 'store']);
        Route::get('marches/{id}', [MarcheController::class, 'show']);
        Route::put('marches/{id}', [MarcheController::class, 'update']);
        Route::delete('marches/{id}', [MarcheController::class, 'destroy']);

        // Loi Finance
        Route::get('loi-finance', [LoiFinanceController::class, 'index']);
        Route::post('loi-finance', [LoiFinanceController::class, 'store']);
        Route::get('loi-finance/{id}', [LoiFinanceController::class, 'show']);
        Route::put('loi-finance/{id}', [LoiFinanceController::class, 'update']);
        Route::delete('loi-finance/{id}', [LoiFinanceController::class, 'destroy']);

        // Agenda
        Route::get('agenda', [AgendaController::class, 'index']);
        Route::post('agenda', [AgendaController::class, 'store']);
        Route::get('agenda/{id}', [AgendaController::class, 'show']);
        Route::put('agenda/{id}', [AgendaController::class, 'update']);
        Route::delete('agenda/{id}', [AgendaController::class, 'destroy']);

        // Map
        Route::get('map/locations', [MapController::class, 'locations']);
    });
});

