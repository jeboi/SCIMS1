<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class ApiAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Priority 1: Bearer token
        if ($request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());

            if ($token && $token->tokenable) {
                // Set user on sanctum guard
                auth('sanctum')->setUser($token->tokenable);
                
                // ALSO set on web guard and default guard (so $request->user() works)
                Auth::guard('web')->setUser($token->tokenable);
                Auth::setUser($token->tokenable);

                return $next($request);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token.',
            ], 401);
        }

        // Priority 2: Session-based
        if (auth('sanctum')->check()) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated.',
        ], 401);
    }
}