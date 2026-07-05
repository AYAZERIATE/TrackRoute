<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoiFinanceController;
use App\Http\Controllers\MarcheController;
use App\Http\Controllers\MapController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('agenda', AgendaController::class);

    Route::apiResource('marche', MarcheController::class);

    Route::apiResource('loifinance', LoiFinanceController::class);

    Route::get('/dashboard', [DashboardController::class, 'stats']);

    Route::get('/map', [MapController::class, 'locations']);
});