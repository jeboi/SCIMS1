<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HotelStockRequest;
use App\Models\HotelStockRequestDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HotelStockRequestController extends Controller
{
    /**
     * Display all hotel stock requests.
     */
    public function index()
    {
        $requests = HotelStockRequest::with([
            'department',
            'requestedBy',
            'details.item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Store a new hotel stock request with details.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => [
                'required',
                'integer',
                'exists:hotel_departments,department_id',
            ],

            'requested_by' => [
                'required',
                'integer',
                'exists:users,id',
            ],

            'request_date' => [
                'required',
                'date',
            ],

            'status' => [
                'required',
                'string',
                'max:50',
            ],

            'details' => [
                'required',
                'array',
                'min:1',
            ],

            'details.*.item_id' => [
                'required',
                'integer',
                'exists:items,item_id',
            ],

            'details.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $stockRequest = DB::transaction(function () use ($validated) {

            $stockRequest = HotelStockRequest::create([
                'department_id' => $validated['department_id'],
                'requested_by' => $validated['requested_by'],
                'request_date' => $validated['request_date'],
                'status' => $validated['status'],
            ]);

            foreach ($validated['details'] as $detail) {
                HotelStockRequestDetail::create([
                    'stock_request_id' => $stockRequest->stock_request_id,
                    'item_id' => $detail['item_id'],
                    'quantity' => $detail['quantity'],
                ]);
            }

            return $stockRequest;
        });

        $stockRequest->load([
            'department',
            'requestedBy',
            'details.item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hotel stock request created successfully.',
            'data' => $stockRequest,
        ], 201);
    }

    /**
     * Display a specific hotel stock request.
     */
    public function show(HotelStockRequest $hotelStockRequest)
    {
        $hotelStockRequest->load([
            'department',
            'requestedBy',
            'details.item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $hotelStockRequest,
        ]);
    }

    /**
     * Update a hotel stock request.
     */
    public function update(
        Request $request,
        HotelStockRequest $hotelStockRequest
    ) {
        $validated = $request->validate([
            'department_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:hotel_departments,department_id',
            ],

            'requested_by' => [
                'sometimes',
                'required',
                'integer',
                'exists:users,id',
            ],

            'request_date' => [
                'sometimes',
                'required',
                'date',
            ],

            'status' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],
        ]);

        $hotelStockRequest->update($validated);

        $hotelStockRequest->load([
            'department',
            'requestedBy',
            'details.item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hotel stock request updated successfully.',
            'data' => $hotelStockRequest,
        ]);
    }

    /**
     * Delete a hotel stock request.
     */
    public function destroy(HotelStockRequest $hotelStockRequest)
    {
        $hotelStockRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hotel stock request deleted successfully.',
        ]);
    }
}