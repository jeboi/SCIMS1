<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ForecastService
{
    protected $mlServiceUrl;

    public function __construct()
    {
        $this->mlServiceUrl = env('ML_SERVICE_URL', 'http://localhost:8001');
    }

    public function generateForecast($items, $days = 30)
    {
        try {
            $response = Http::timeout(60)->post($this->mlServiceUrl . '/forecast', [
                'items' => $items,
                'days' => $days
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('ML Service Error: ' . $response->body());
            return [
                'success' => false,
                'message' => 'ML Service unavailable: ' . $response->status(),
                'data' => []
            ];

        } catch (\Exception $e) {
            Log::error('ML Service Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'ML Service error: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    public function healthCheck()
    {
        try {
            $response = Http::timeout(5)->get($this->mlServiceUrl . '/health');
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function detectSeasonal($items)
    {
        try {
            $response = Http::timeout(60)->post($this->mlServiceUrl . '/seasonal', [
                'items' => $items,
                'days' => 365
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('ML Service Seasonal Error: ' . $response->body());
            return [
                'success' => false,
                'message' => 'ML Service unavailable: ' . $response->status(),
                'data' => []
            ];

        } catch (\Exception $e) {
            Log::error('ML Service Seasonal Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'ML Service error: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
}