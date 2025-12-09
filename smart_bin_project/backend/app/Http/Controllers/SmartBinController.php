<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SmartBin;
use App\Models\Alert;
use App\Http\Requests\Bin\AddBinRequest;

class SmartBinController extends Controller
{

    public function getDashboardStats()
    {
        return SmartBin::getDashboardStats();
    }

    public function getBinList(Request $request)
    {
        return SmartBin::getBinList($request);
    }

    public function addBin(AddBinRequest $request)
    {
        $result = SmartBin::addBin($request);
        return $result;
    }

    public function updateBin(UpdateBinRequest $request, $id)
    {
        return SmartBin::updateBin($request, $id);
    }

    public function deleteBin($id)
    {
        return SmartBin::deleteBin($id);
    }

    public function getAlertList(Request $request)
    {
        return Alert::getAlertList($request);
    }
    
    public function getBinDetails($id)
    {
        $bin = SmartBin::find($id);
        if($bin) {
            return response()->json($bin, 200);
        }
        return response()->json(['message' => 'Bin not found'], 404);
    }
}