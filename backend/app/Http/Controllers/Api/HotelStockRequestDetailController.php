<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HotelStockRequestDetail;
use Illuminate\Http\Request;

class HotelStockRequestDetailController extends Controller
{
    /**
     * Display all hotel stock request details.
     */
    public function index()
    {
        $details = HotelStockRequestDetail::with([
            'stockRequest',
            'item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $details,
        ]);
    }

    /**
     * Store a new hotel stock request detail.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'stock_request_id' => [
                'required',
                'integer',
                'exists:hotel_stock_requests,stock_request_id',
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

        $detail = HotelStockRequestDetail::create($validated);

        $detail->load([
            'stockRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hotel stock request detail created successfully.',
            'data' => $detail,
        ], 201);
    }

    /**
     * Display a specific hotel stock request detail.
     */
    public function show(
        HotelStockRequestDetail $hotelStockRequestDetail
    ) {
        $hotelStockRequestDetail->load([
            'stockRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $hotelStockRequestDetail,
        ]);
    }

    /**
     * Update a hotel stock request detail.
     */
    public function update(
        Request $request,
        HotelStockRequestDetail $hotelStockRequestDetail
    ) {
        $validated = $request->validate([
            'stock_request_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:hotel_stock_requests,stock_request_id',
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

        $hotelStockRequestDetail->update($validated);

        $hotelStockRequestDetail->load([
            'stockRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hotel stock request detail updated successfully.',
            'data' => $hotelStockRequestDetail,
        ]);
    }

    /**
     * Delete a hotel stock request detail.
     */
    public function destroy(
        HotelStockRequestDetail $hotelStockRequestDetail
    ) {
        $hotelStockRequestDetail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hotel stock request detail deleted successfully.',
        ]);
    }
}