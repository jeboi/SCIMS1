<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryItemController extends Controller
{
    /**
     * Display all delivery items.
     */
    public function index()
    {
        $deliveryItems = DeliveryItem::with([
            'delivery',
            'item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $deliveryItems,
        ]);
    }

    /**
     * Store a new delivery item and update inventory stock.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'delivery_id' => [
                'required',
                'integer',
                'exists:deliveries,delivery_id',
            ],
            'item_id' => [
                'required',
                'integer',
                'exists:items,item_id',
            ],
            'quantity_received' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $deliveryItem = DeliveryItem::create($validated);

            $item = $deliveryItem->item;

            $item->increment(
                'current_stock',
                $validated['quantity_received']
            );

            $transaction = InventoryTransaction::create([
                'item_id' => $validated['item_id'],
                'warehouse_id' => $this->getWarehouseId(
                    $validated['delivery_id']
                ),
                'transaction_type' => 'receiving',
                'quantity' => $validated['quantity_received'],
                'reference_no' => 'DEL-' . $validated['delivery_id'],
                'transaction_date' => now(),
                'performed_by' => auth()->id(),
            ]);

            return [
                'deliveryItem' => $deliveryItem,
                'transaction' => $transaction,
            ];
        });

        $result['deliveryItem']->load([
            'delivery',
            'item',
        ]);

        $result['transaction']->load([
            'item',
            'warehouse',
            'performedBy',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery item received and inventory updated successfully.',
            'data' => [
                'delivery_item' => $result['deliveryItem'],
                'inventory_transaction' => $result['transaction'],
            ],
        ], 201);
    }

    /**
     * Get the warehouse assigned to the delivery.
     */
    private function getWarehouseId(int $deliveryId): int
    {
        $warehouseId = DB::table('receiving_records')
            ->where('delivery_id', $deliveryId)
            ->value('warehouse_id');

        if (!$warehouseId) {
            abort(422, 'A receiving record is required before receiving delivery items.');
        }

        return (int) $warehouseId;
    }

    /**
     * Display a specific delivery item.
     */
    public function show(DeliveryItem $deliveryItem)
    {
        $deliveryItem->load([
            'delivery',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $deliveryItem,
        ]);
    }

    /**
     * Update a delivery item.
     */
    public function update(
        Request $request,
        DeliveryItem $deliveryItem
    ) {
        $validated = $request->validate([
            'delivery_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:deliveries,delivery_id',
            ],
            'item_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:items,item_id',
            ],
            'quantity_received' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $deliveryItem->update($validated);

        $deliveryItem->load([
            'delivery',
            'item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery item updated successfully.',
            'data' => $deliveryItem,
        ]);
    }

    /**
     * Delete a delivery item.
     */
    public function destroy(DeliveryItem $deliveryItem)
    {
        $deliveryItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Delivery item deleted successfully.',
        ]);
    }
}