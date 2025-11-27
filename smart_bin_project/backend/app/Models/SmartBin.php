<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Exception;

class SmartBin extends Model
{
    use HasFactory;

    protected $table = 'bins';
    protected $primaryKey = 'bin_id';

    protected $fillable = [
        'bin_identifier', 'location', 'fill_level', 'battery_level', 
        'status', 'created_at', 'updated_at'
    ];

    public static function addBin($request)
    {
        try {
            // Logic matches your ClaimRequest pattern
            $bin = self::create([
                'bin_identifier' => $request->bin_identifier,
                'location' => $request->location,
                'fill_level' => 0,
                'battery_level' => 100,
                'status' => 'Active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'Bin added successfully',
                'data' => $bin
            ], 200);

        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ... keep existing getBinList and getDashboardStats methods ...
    public static function getBinList($request)
    {
        // (Keep your existing getBinList logic here)
        try {
            $query = self::query();
            if ($request->has('search') && $request->search != '') {
                $query->where('bin_identifier', 'like', '%' . $request->search . '%')
                      ->orWhere('location', 'like', '%' . $request->search . '%');
            }
            $bins = $query->orderBy('bin_id', 'desc')->get();
            return response()->json($bins, 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public static function getDashboardStats()
    {
        // (Keep your existing getDashboardStats logic here)
        try {
            $totalBins = self::count();
            $activeAlerts = Alert::where('is_resolved', 0)->count();
            $chartData = [45, 50, 60, 55, 70, 85, 90]; 
            return response()->json([
                'total_bins' => $totalBins,
                'active_alerts' => $activeAlerts,
                'chart_data' => $chartData
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}