<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Always return null for all requests to prevent any redirect
        return null;
    }

    /**
     * Handle an unauthenticated user.
     * Override the parent method to prevent route('login') from being called.
     */
    protected function unauthenticated($request, array $guards)
    {
        // Return JSON response for ALL requests (since this is an API)
        // This completely bypasses the parent's redirect logic
        throw new \Illuminate\Auth\AuthenticationException(
            'Unauthenticated.',
            $guards,
            null, // No redirect URL
            response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please log in to continue.',
                'errors' => [
                    'token' => ['Invalid or missing authentication token.']
                ]
            ], 401)
        );
    }
}