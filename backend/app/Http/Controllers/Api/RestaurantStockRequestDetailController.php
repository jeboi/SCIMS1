<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantStockRequestDetail;
use Illuminate\Http\Request;

class RestaurantStockRequestDetailController extends Controller
{
    /**
     * Display all restaurant stock request details.
     */
    public function index()
    {
        $details = RestaurantStockRequestDetail::with([
            'stockRequest',
            'item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $details,
        ]);
    }

    /**
     * Store a new restaurant stock request detail.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'stock_request_id' => [
                'required',
                'integer',
                'exists:restaurant_stock_requests,stock_request_id',
            ],
            'item_id' => [
                'required',
                'integer',
                'exists:items,item_id',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $detail = RestaurantStockRequestDetail::create($validated);

        $detail->load([
            'stockRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant stock request detail created successfully.',
            'data' => $detail,
        ], 201);
    }

    /**
     * Display a specific restaurant stock request detail.
     */
    public function show(
        RestaurantStockRequestDetail $restaurantStockRequestDetail
    ) {
        $restaurantStockRequestDetail->load([
            'stockRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $restaurantStockRequestDetail,
        ]);
    }

    /**
     * Update a restaurant stock request detail.
     */
    public function update(
        Request $request,
        RestaurantStockRequestDetail $restaurantStockRequestDetail
    ) {
        $validated = $request->validate([
            'stock_request_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:restaurant_stock_requests,stock_request_id',
            ],
            'item_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:items,item_id',
            ],
            'quantity' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $restaurantStockRequestDetail->update($validated);

        $restaurantStockRequestDetail->load([
            'stockRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant stock request detail updated successfully.',
            'data' => $restaurantStockRequestDetail,
        ]);
    }

    /**
     * Delete a restaurant stock request detail.
     */
    public function destroy(
        RestaurantStockRequestDetail $restaurantStockRequestDetail
    ) {
        $restaurantStockRequestDetail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Restaurant stock request detail deleted successfully.',
        ]);
    }
}