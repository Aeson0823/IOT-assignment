<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Exception;

class Alert extends Model
{
    use HasFactory;

    protected $table = 'alerts';
    protected $primaryKey = 'alert_id';

    protected $fillable = [
        'bin_id', 
        'alert_type', 
        'message', 
        'is_resolved', 
        'created_at', 
        'updated_at'
    ];

    // Relationship to link an Alert to a Bin
    public function bin()
    {
        return $this->belongsTo(SmartBin::class, 'bin_id', 'bin_id');
    }

    public static function getAlertList($request)
    {
        try {
            // Get alerts and join with bin data so we know which bin has the alert
            $alerts = self::with('bin')
                ->where('is_resolved', 0) // Only show unresolved alerts
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($alerts, 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}