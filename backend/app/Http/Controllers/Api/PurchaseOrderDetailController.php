<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrderDetail;
use Illuminate\Http\Request;

class PurchaseOrderDetailController extends Controller
{
    /**
     * Display all purchase order details.
     */
    public function index()
    {
        $details = PurchaseOrderDetail::with([
            'purchaseOrder',
            'item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $details,
        ]);
    }

    /**
     * Store a new purchase order detail.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'po_id' => [
                'required',
                'integer',
                'exists:purchase_orders,po_id',
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
            'unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $validated['subtotal'] =
            $validated['quantity'] * $validated['unit_price'];

        $detail = PurchaseOrderDetail::create($validated);

        $detail->load([
            'purchaseOrder',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase order detail created successfully.',
            'data' => $detail,
        ], 201);
    }

    /**
     * Display a specific purchase order detail.
     */
    public function show(PurchaseOrderDetail $purchaseOrderDetail)
    {
        $purchaseOrderDetail->load([
            'purchaseOrder',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $purchaseOrderDetail,
        ]);
    }

    /**
     * Update a purchase order detail.
     */
    public function update(
        Request $request,
        PurchaseOrderDetail $purchaseOrderDetail
    ) {
        $validated = $request->validate([
            'po_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:purchase_orders,po_id',
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
            'unit_price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        if (
            isset($validated['quantity']) ||
            isset($validated['unit_price'])
        ) {
            $quantity = $validated['quantity']
                ?? $purchaseOrderDetail->quantity;

            $unitPrice = $validated['unit_price']
                ?? $purchaseOrderDetail->unit_price;

            $validated['subtotal'] = $quantity * $unitPrice;
        }

        $purchaseOrderDetail->update($validated);

        $purchaseOrderDetail->load([
            'purchaseOrder',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Purchase order detail updated successfully.',
            'data' => $purchaseOrderDetail,
        ]);
    }

    /**
     * Delete a purchase order detail.
     */
    public function destroy(PurchaseOrderDetail $purchaseOrderDetail)
    {
        $purchaseOrderDetail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Purchase order detail deleted successfully.',
        ]);
    }
}