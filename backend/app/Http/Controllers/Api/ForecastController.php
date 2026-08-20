<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Item;
use App\Services\ForecastService;
use Illuminate\Http\Request;

class ForecastController extends Controller
{
    protected $forecastService;

    public function __construct(ForecastService $forecastService)
    {
        $this->forecastService = $forecastService;
    }

    public function forecast(Request $request)
    {
        $days = $request->input('days', 30);
        $itemIds = $request->input('item_ids', []);

        $query = Item::with('category');

        if (!empty($itemIds)) {
            $query->whereIn('item_id', $itemIds);
        }

        $items = $query->get();
        $mlItems = [];

        foreach ($items as $item) {
            $transactions = InventoryTransaction::where('item_id', $item->item_id)
                ->where('transaction_type', 'transfer_out')
                ->whereDate('transaction_date', '>=', now()->subDays(90))
                ->orderBy('transaction_date', 'asc')
                ->get();

            $dailyUsage = [];

            foreach ($transactions as $tx) {
                $date = $tx->transaction_date->format('Y-m-d');
                if (!isset($dailyUsage[$date])) {
                    $dailyUsage[$date] = 0;
                }
                $dailyUsage[$date] += abs($tx->quantity);
            }

            $transactionData = [];
            foreach ($dailyUsage as $date => $quantity) {
                $transactionData[] = [
                    'date' => $date,
                    'quantity' => $quantity
                ];
            }

            $mlItems[] = [
                'item_id' => $item->item_id,
                'item_name' => $item->item_name,
                'transactions' => $transactionData
            ];
        }

        $result = $this->forecastService->generateForecast($mlItems, $days);

        return response()->json($result);
    }

    public function health()
    {
        return response()->json([
            'ml_service' => $this->forecastService->healthCheck()
        ]);
    }

    public function seasonal(Request $request)
    {
        $itemIds = $request->input('item_ids', []);

        // Get items
        $query = Item::with('category');

        if (!empty($itemIds)) {
            $query->whereIn('item_id', $itemIds);
        }

        $items = $query->get();

        // Prepare data for ML service
        $mlItems = [];

        foreach ($items as $item) {
            $transactions = InventoryTransaction::where('item_id', $item->item_id)
                ->where('transaction_type', 'transfer_out')
                ->whereDate('transaction_date', '>=', now()->subDays(365))  // 1 year
                ->orderBy('transaction_date', 'asc')
                ->get();

            $dailyUsage = [];

            foreach ($transactions as $tx) {
                $date = $tx->transaction_date->format('Y-m-d');
                if (!isset($dailyUsage[$date])) {
                    $dailyUsage[$date] = 0;
                }
                $dailyUsage[$date] += abs($tx->quantity);
            }

            $transactionData = [];
            foreach ($dailyUsage as $date => $quantity) {
                $transactionData[] = [
                    'date' => $date,
                    'quantity' => $quantity
                ];
            }

            $mlItems[] = [
                'item_id' => $item->item_id,
                'item_name' => $item->item_name,
                'transactions' => $transactionData
            ];
        }

        $result = $this->forecastService->detectSeasonal($mlItems);

        return response()->json($result);
    }
}