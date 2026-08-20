<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseRequestController extends Controller
{
    /**
     * Display all purchase requests.
     */
    public function index()
    {
        $requests = PurchaseRequest::with([
            'requestedBy',
            'details.item',
            'purchaseOrders.supplier',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Store a new purchase request with details.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
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

            'remarks' => [
                'nullable',
                'string',
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

        $purchaseRequest = DB::transaction(function () use ($validated) {

            $purchaseRequest = PurchaseRequest::create([
                'requested_by' => $validated['requested_by'],
                'request_date' => $validated['request_date'],
                'status' => $validated['status'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            foreach ($validated['details'] as $detail) {
                PurchaseRequestDetail::create([
                    'request_id' => $purchaseRequest->request_id,
                    'item_id' => $detail['item_id'],
                    'quantity' => $detail['quantity'],
                ]);
            }

            return $purchaseRequest;
        });

        $purchaseRequest->load([
            'requestedBy',
            'details.item',
            'purchaseOrders.supplier',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase request created successfully.',
            'data' => $purchaseRequest,
        ], 201);
    }

    /**
     * Display a specific purchase request.
     */
    public function show(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->load([
            'requestedBy',
            'details.item',
            'purchaseOrders.supplier',
        ]);

        return response()->json([
            'success' => true,
            'data' => $purchaseRequest,
        ]);
    }

    /**
     * Update a purchase request.
     */
    public function update(
        Request $request,
        PurchaseRequest $purchaseRequest
    ) {
        $validated = $request->validate([
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

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        $purchaseRequest->update($validated);

        $purchaseRequest->load([
            'requestedBy',
            'details.item',
            'purchaseOrders.supplier',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase request updated successfully.',
            'data' => $purchaseRequest,
        ]);
    }

    /**
     * Delete a purchase request.
     */
    public function destroy(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Purchase request deleted successfully.',
        ]);
    }
}