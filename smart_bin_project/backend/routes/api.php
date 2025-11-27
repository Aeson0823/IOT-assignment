<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SmartBinController;

Route::prefix('v1')->group(function () {
    // Dashboard & Stats
    Route::get('/dashboard/stats', [SmartBinController::class, 'getDashboardStats']);

    // Bins
    Route::get('/bins', [SmartBinController::class, 'getBinList']);
    Route::post('/bins/add', [SmartBinController::class, 'addBin']);
    Route::get('/bins/{id}', [SmartBinController::class, 'getBinDetails']);

    // Alerts
    Route::get('/alerts', [SmartBinController::class, 'getAlertList']);
});