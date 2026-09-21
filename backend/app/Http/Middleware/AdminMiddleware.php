<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Use sanctum guard explicitly (matches what ApiAuth set)
        $user = $request->user('sanctum') ?? auth('sanctum')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check by role_id (most reliable)
        if ((int) $user->role_id === 1) {
            return $next($request);
        }

        // Fallback: check role relationship
        if ($user->role && $user->role->name === 'Administrator') {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Forbidden. Administrator access required.',
        ], 403);
    }
}