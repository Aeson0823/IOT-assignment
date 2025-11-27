<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SmartBin;
use App\Models\Alert;
use App\Http\Requests\Bin\AddBinRequest;

class SmartBinController extends Controller
{
    /**
     * Get Dashboard Stats
     */
    public function getDashboardStats()
    {
        return SmartBin::getDashboardStats();
    }

    /**
     * Get List of Bins
     */
    public function getBinList(Request $request)
    {
        return SmartBin::getBinList($request);
    }

    /**
     * Add a New Bin
     */
    public function addBin(AddBinRequest $request)
    {
        // The Request class handles validation before reaching here
        $result = SmartBin::addBin($request);
        return $result;
    }

    /**
     * Get List of Alerts
     */
    public function getAlertList(Request $request)
    {
        return Alert::getAlertList($request);
    }
    
    /**
     * Get Details for a single bin (Optional)
     */
    public function getBinDetails($id)
    {
        $bin = SmartBin::find($id);
        if($bin) {
            return response()->json($bin, 200);
        }
        return response()->json(['message' => 'Bin not found'], 404);
    }
}