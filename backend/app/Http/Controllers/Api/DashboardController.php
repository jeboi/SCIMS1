<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard KPI metrics.
     */
    public function metrics(): JsonResponse
    {
        $totalItems = DB::table('items')
            ->count();

        $lowStockItems = DB::table('items')
            ->whereColumn('current_stock', '<=', 'reorder_level')
            ->count();

        $pendingRequests = DB::table('purchase_requests')
            ->whereRaw('LOWER(status) = ?', ['pending'])
            ->count();

        $pendingOrders = DB::table('purchase_orders')
            ->whereRaw('LOWER(status) = ?', ['pending'])
            ->count();

        return response()->json([
            'totalItems' => $totalItems,
            'lowStockItems' => $lowStockItems,
            'pendingRequests' => $pendingRequests,
            'pendingOrders' => $pendingOrders,
        ]);
    }
}