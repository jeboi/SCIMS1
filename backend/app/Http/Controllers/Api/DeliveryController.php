<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Display all deliveries.
     */
    public function index()
    {
        $deliveries = Delivery::with([
            'purchaseOrder.supplier',
            'deliveryItems',
            'deliveryItems.item',
            'receivingRecord',
            'receivingRecord.warehouse',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $deliveries,
        ]);
    }

    /**
     * Store a new delivery.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'po_id' => [
                'nullable',
                'integer',
                'exists:purchase_orders,po_id',
            ],
            'tracking_number' => [
                'required',
                'string',
                'max:100',
            ],
            'vehicle' => [
                'nullable',
                'string',
                'max:100',
            ],
            'delivery_date' => [
                'required',
                'date',
            ],
            'status' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $delivery = Delivery::create($validated);

        $delivery->load([
            'purchaseOrder.supplier',
            'deliveryItems',
            'deliveryItems.item',
            'receivingRecord',
            'receivingRecord.warehouse',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery created successfully.',
            'data' => $delivery,
        ], 201);
    }

    /**
     * Display a specific delivery.
     */
    public function show(Delivery $delivery)
    {
        $delivery->load([
            'purchaseOrder.supplier',
            'deliveryItems',
            'deliveryItems.item',
            'receivingRecord',
            'receivingRecord.warehouse',
        ]);

        return response()->json([
            'success' => true,
            'data' => $delivery,
        ]);
    }

    /**
     * Update a delivery.
     */
    public function update(Request $request, Delivery $delivery)
    {
        $validated = $request->validate([
            'po_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:purchase_orders,po_id',
            ],
            'tracking_number' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'vehicle' => [
                'nullable',
                'string',
                'max:100',
            ],
            'delivery_date' => [
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

        $delivery->update($validated);

        $delivery->load([
            'purchaseOrder.supplier',
            'deliveryItems',
            'deliveryItems.item',
            'receivingRecord',
            'receivingRecord.warehouse',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery updated successfully.',
            'data' => $delivery,
        ]);
    }

    /**
     * Delete a delivery.
     */
    public function destroy(Delivery $delivery)
    {
        $delivery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Delivery deleted successfully.',
        ]);
    }
}