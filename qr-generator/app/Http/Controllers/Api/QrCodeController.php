<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QrCodeRequest;
use App\Models\QrCode;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class QrCodeController extends Controller
{
    public function generate(QrCodeRequest $request): JsonResponse
    {
        // Generate cache key based on request parameters
        $cacheKey = 'qr_' . md5(json_encode($request->validated()));
        
        // Try to get from cache first
        if ($cachedResponse = Cache::get($cacheKey)) {
            return response()->json($cachedResponse);
        }
        
        // Generate new QR code
        $service = new QrCodeService($request->validated());
        $result = $service->generate();
        
        if ($result['success']) {
            // Store in database
            QrCode::create([
                'category' => $request->qrCategory,
                'content' => $request->text,
                'configuration' => $request->validated(),
                'output_format' => $request->qrFormat ?? 'png',
                'file_path' => $result['url']
            ]);
            
            // Cache the successful result for 24 hours
            Cache::put($cacheKey, $result, now()->addHours(24));
        }
        
        return response()->json($result);
    }

    public function bulkGenerate(QrCodeRequest $request): JsonResponse
    {
        // Implement bulk generation with parallel processing
        // This is a placeholder for future implementation
        return response()->json([
            'success' => false,
            'error' => 'Bulk generation not implemented yet'
        ]);
    }

    public function getHistory(): JsonResponse
    {
        $history = QrCode::latest()
            ->take(50)
            ->get(['category', 'content', 'output_format', 'file_path', 'created_at']);
        
        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
