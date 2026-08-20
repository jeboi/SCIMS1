<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Login user and issue Sanctum token.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken('scims-api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Get the currently authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'authenticated' => true,
            'user' => $request->user(),
        ]);
    }

    /**
     * Logout user by revoking the current Sanctum token.
     */
    public function logout(Request $request)
{
    // Log out the user from the session
    Auth::guard('web')->logout();
    
    // Invalidate the session
    $request->session()->invalidate();
    
    // Regenerate CSRF token
    $request->session()->regenerateToken();
    
    return response()->json([
        'success' => true,
        'message' => 'Logged out successfully.',
    ]);
}
}