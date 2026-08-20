<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    /**
     * Display all purchase orders.
     */
    public function index()
    {
        $purchaseOrders = PurchaseOrder::with([
            'supplier',
            'purchaseRequest',
            'details.item',
            'deliveries',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $purchaseOrders,
        ]);
    }

    /**
     * Store a new purchase order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => [
                'required',
                'integer',
                'exists:suppliers,supplier_id',
            ],
            'request_id' => [
                'required',
                'integer',
                'exists:purchase_requests,request_id',
            ],
            'po_number' => [
                'required',
                'string',
                'max:100',
            ],
            'po_date' => [
                'required',
                'date',
            ],
            'status' => [
                'required',
                'string',
                'max:50',
            ],
            'expected_delivery' => [
                'nullable',
                'date',
            ],
        ]);

        $purchaseOrder = PurchaseOrder::create($validated);

        $purchaseOrder->load([
            'supplier',
            'purchaseRequest',
            'details.item',
            'deliveries',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase order created successfully.',
            'data' => $purchaseOrder,
        ], 201);
    }

    /**
     * Display a specific purchase order.
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load([
            'supplier',
            'purchaseRequest',
            'details.item',
            'deliveries',
        ]);

        return response()->json([
            'success' => true,
            'data' => $purchaseOrder,
        ]);
    }

    /**
     * Update a purchase order.
     */
    public function update(
        Request $request,
        PurchaseOrder $purchaseOrder
    ) {
        $validated = $request->validate([
            'supplier_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:suppliers,supplier_id',
            ],
            'request_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:purchase_requests,request_id',
            ],
            'po_number' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'po_date' => [
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
            'expected_delivery' => [
                'nullable',
                'date',
            ],
        ]);

        $purchaseOrder->update($validated);

        $purchaseOrder->load([
            'supplier',
            'purchaseRequest',
            'details.item',
            'deliveries',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase order updated successfully.',
            'data' => $purchaseOrder,
        ]);
    }

    /**
     * Delete a purchase order.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Purchase order deleted successfully.',
        ]);
    }
}