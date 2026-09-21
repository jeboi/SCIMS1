<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Convert an authentication exception into an unauthenticated response.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // Check if the exception already has a response (from our middleware)
        if ($exception->getResponse()) {
            return $exception->getResponse();
        }

        // For API requests, return a JSON response
        if ($request->expectsJson() || $request->is('api/*') || $request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please log in to continue.',
                'errors' => [
                    'token' => ['Invalid or missing authentication token.']
                ]
            ], Response::HTTP_UNAUTHORIZED);
        }

        // For web requests, return a redirect
        return redirect()->guest(route('login'));
    }
}