<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class QrCodeRateLimiter
{
    public function handle(Request $request, Closure $next): Response
    {
        // Different limits for bulk vs single generation
        $key = 'qr_' . ($request->path() === 'api/qr/bulk' ? 'bulk_' : 'single_') . $request->ip();
        $maxAttempts = $request->path() === 'api/qr/bulk' ? 10 : 60;
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'success' => false,
                'error' => 'Too many requests. Please try again later.',
                'retry_after' => RateLimiter::availableIn($key)
            ], 429);
        }
        
        RateLimiter::hit($key, 60); // Key expires in 60 seconds
        
        return $next($request);
    }
}
