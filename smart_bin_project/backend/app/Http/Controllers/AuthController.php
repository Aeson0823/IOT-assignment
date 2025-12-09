<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        return User::signup($request);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric'
        ]);
    
        return User::verifyOTP($request);
    }

    public function login(LoginRequest $request)
    {
        return User::signin($request);
    }

    public function logout(Request $request)
    {
        return User::signout($request->user());
    }
}