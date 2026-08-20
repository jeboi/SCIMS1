<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequestDetail;
use Illuminate\Http\Request;

class PurchaseRequestDetailController extends Controller
{
    /**
     * Display all purchase request details.
     */
    public function index()
    {
        $details = PurchaseRequestDetail::with([
            'purchaseRequest',
            'item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $details,
        ]);
    }

    /**
     * Store a new purchase request detail.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_id' => [
                'required',
                'integer',
                'exists:purchase_requests,request_id',
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

        $detail = PurchaseRequestDetail::create($validated);

        $detail->load([
            'purchaseRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase request detail created successfully.',
            'data' => $detail,
        ], 201);
    }

    /**
     * Display a specific purchase request detail.
     */
    public function show(PurchaseRequestDetail $purchaseRequestDetail)
    {
        $purchaseRequestDetail->load([
            'purchaseRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $purchaseRequestDetail,
        ]);
    }

    /**
     * Update a purchase request detail.
     */
    public function update(
        Request $request,
        PurchaseRequestDetail $purchaseRequestDetail
    ) {
        $validated = $request->validate([
            'request_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:purchase_requests,request_id',
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

        $purchaseRequestDetail->update($validated);

        $purchaseRequestDetail->load([
            'purchaseRequest',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase request detail updated successfully.',
            'data' => $purchaseRequestDetail,
        ]);
    }

    /**
     * Delete a purchase request detail.
     */
    public function destroy(PurchaseRequestDetail $purchaseRequestDetail)
    {
        $purchaseRequestDetail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Purchase request detail deleted successfully.',
        ]);
    }
}