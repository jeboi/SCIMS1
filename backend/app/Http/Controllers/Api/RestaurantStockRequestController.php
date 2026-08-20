<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantStockRequest;
use Illuminate\Http\Request;

class RestaurantStockRequestController extends Controller
{
    /**
     * Display all restaurant stock requests.
     */
    public function index()
    {
        $stockRequests = RestaurantStockRequest::with([
            'department',
            'requestedBy',
            'details.item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $stockRequests,
        ]);
    }

    /**
     * Store a new restaurant stock request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => [
                'required',
                'integer',
                'exists:restaurant_departments,department_id',
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
        ]);

        $stockRequest = RestaurantStockRequest::create($validated);

        $stockRequest->load([
            'department',
            'requestedBy',
            'details.item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant stock request created successfully.',
            'data' => $stockRequest,
        ], 201);
    }

    /**
     * Display a specific restaurant stock request.
     */
    public function show(RestaurantStockRequest $restaurantStockRequest)
    {
        $restaurantStockRequest->load([
            'department',
            'requestedBy',
            'details.item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $restaurantStockRequest,
        ]);
    }

    /**
     * Update a restaurant stock request.
     */
    public function update(
        Request $request,
        RestaurantStockRequest $restaurantStockRequest
    ) {
        $validated = $request->validate([
            'department_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:restaurant_departments,department_id',
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

        $restaurantStockRequest->update($validated);

        $restaurantStockRequest->load([
            'department',
            'requestedBy',
            'details.item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant stock request updated successfully.',
            'data' => $restaurantStockRequest,
        ]);
    }

    /**
     * Delete a restaurant stock request.
     */
    public function destroy(
        RestaurantStockRequest $restaurantStockRequest
    ) {
        $restaurantStockRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Restaurant stock request deleted successfully.',
        ]);
    }
}