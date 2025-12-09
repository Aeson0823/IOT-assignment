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
        'user_id', 
        'bin_identifier', 
        'location', 
        'fill_level', 
        'battery_level', 
        'status', 
        'created_at', 
        'updated_at'
    ];

    public static function addBin($request)
    {
        try {
            $userId = auth()->id(); 

            $existingBin = self::where('bin_identifier', $request->bin_identifier)
                               ->where('user_id', $userId)
                               ->first();

            if ($existingBin) {
                return response()->json(['message' => 'You already have a bin with this ID.'], 400);
            }

            $bin = self::create([
                'user_id' => $userId,
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

    public static function updateBin($request, $id)
    {
        try {
            $userId = auth()->id();
            $bin = self::where('bin_id', $id)->where('user_id', $userId)->first();

            if (!$bin) {
                return response()->json(['message' => 'Bin not found or unauthorized.'], 404);
            }

            if ($request->bin_identifier !== $bin->bin_identifier) {
                $exists = self::where('bin_identifier', $request->bin_identifier)
                              ->where('user_id', $userId)
                              ->exists();
                if ($exists) {
                    return response()->json(['message' => 'Bin Identifier already exists.'], 400);
                }
            }

            $bin->update([
                'bin_identifier' => $request->bin_identifier,
                'location' => $request->location,
                'status' => $request->status,
                'updated_at' => now(),
            ]);

            return response()->json(['message' => 'Bin updated successfully', 'data' => $bin], 200);

        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public static function deleteBin($id)
    {
        try {
            $userId = auth()->id();

            $bin = self::where('bin_id', $id)->where('user_id', $userId)->first();

            if (!$bin) {
                return response()->json(['message' => 'Bin not found or unauthorized.'], 404);
            }

            $bin->delete();

            return response()->json(['message' => 'Bin deleted successfully'], 200);

        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public static function getBinList($request)
    {
        try {
            $userId = auth()->id();

            $query = self::where('user_id', $userId);

            if ($request->has('search') && $request->search != '') {
                $query->where(function($q) use ($request) {
                    $q->where('bin_identifier', 'like', '%' . $request->search . '%')
                      ->orWhere('location', 'like', '%' . $request->search . '%');
                });
            }

            $bins = $query->orderBy('bin_id', 'desc')->get();

            return response()->json($bins, 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public static function getDashboardStats()
    {
        try {
            $userId = auth()->id();

            $totalBins = self::where('user_id', $userId)->count();

            $activeAlerts = Alert::whereHas('bin', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })->where('is_resolved', 0)->count();

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
    
    public function alerts() {
        return $this->hasMany(Alert::class, 'bin_id');
    }
}