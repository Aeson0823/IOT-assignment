<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\OTPMail;
use Exception;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = ['name', 'email', 'password', 'status', 'verification_code', 'email_verified_at'];
    protected $hidden = ['password', 'remember_token', 'verification_code'];
    
    public static function signup($request)
    {
        try {
            $otp = rand(100000, 999999);

            $user = self::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 'active',
                'verification_code' => $otp,
                'email_verified_at' => null,
            ]);

            try {
                Mail::to($user->email)->send(new OTPMail($otp));
            } catch (Exception $e) {
                $user->delete();
                return response()->json(['error' => 'Failed to send email. Please check your internet or SMTP settings.'], 500);
            }

            return response()->json([
                'message' => 'Account created. Please check your email for the OTP code.',
                'email' => $user->email,
                'require_otp' => true
            ], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public static function verifyOTP($request)
    {
        $user = self::where('email', $request->email)->first();

        if (!$user || $user->verification_code != $request->otp) {
            return response()->json(['error' => 'Invalid or expired OTP.'], 400);
        }

        $user->email_verified_at = now();
        $user->verification_code = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully!',
            'access_token' => $token,
            'user' => $user
        ], 200);
    }

    public static function signin($request)
    {
        try {
            $user = self::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json(['error' => 'Invalid credentials.'], 401);
            }

            // CHECK IF VERIFIED
            if ($user->email_verified_at === null) {
                return response()->json(['error' => 'Please verify your email before logging in.'], 403);
            }

            if ($user->status !== 'active') {
                return response()->json(['error' => 'Account is deactivated.'], 403);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public static function signout($user)
    {
        if ($user) {
            $user->tokens()->delete();
            return response()->json(['message' => 'Logged out successfully'], 200);
        }
        return response()->json(['error' => 'User not found'], 404);
    }
}