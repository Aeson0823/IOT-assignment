<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SmartBinController;
use App\Http\Controllers\AuthController;

Route::prefix('v1')->group(function () {
    
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-otp', [AuthController::class, 'verify']);

    Route::middleware('auth:sanctum')->group(function () {
        
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/bins/{id}', [SmartBinController::class, 'updateBin']);
        Route::delete('/bins/{id}', [SmartBinController::class, 'deleteBin']);
        Route::get('/dashboard/stats', [SmartBinController::class, 'getDashboardStats']);
        Route::get('/bins', [SmartBinController::class, 'getBinList']);
        Route::post('/bins/add', [SmartBinController::class, 'addBin']);
        Route::get('/bins/{id}', [SmartBinController::class, 'getBinDetails']);
        Route::get('/alerts', [SmartBinController::class, 'getAlertList']);
    });
});