<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryTransactionController extends Controller
{
    /**
     * Display all inventory transactions.
     */
    public function index(Request $request)
{
    $query = InventoryTransaction::with([
        'item',
        'warehouse',
        'performedBy',
    ]);

    // Filter by transaction type
    if ($request->has('transaction_type') && $request->transaction_type != '') {
        $query->where('transaction_type', $request->transaction_type);
    }

    // Filter by warehouse ID
    if ($request->has('warehouse_id') && $request->warehouse_id != '') {
        $query->where('warehouse_id', $request->warehouse_id);
    }

    // Filter by item ID
    if ($request->has('item_id') && $request->item_id != '') {
        $query->where('item_id', $request->item_id);
    }

    // Date range filter
    if ($request->has('from_date') && $request->from_date != '') {
        $query->whereDate('transaction_date', '>=', $request->from_date);
    }
    if ($request->has('to_date') && $request->to_date != '') {
        $query->whereDate('transaction_date', '<=', $request->to_date);
    }

    $transactions = $query->orderBy('transaction_date', 'desc')->get();

    return response()->json([
        'success' => true,
        'data' => $transactions,
    ]);
}

    /**
     * Store a new inventory transaction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => [
                'required',
                'integer',
                'exists:items,item_id',
            ],
            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,warehouse_id',
            ],
            'transaction_type' => [
                'required',
                'string',
                'in:receiving,issuing,adjustment,transfer_in,transfer_out,return',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'reference_no' => [
                'nullable',
                'string',
                'max:100',
            ],
            'transaction_date' => [
                'required',
                'date',
            ],
            'performed_by' => [
                'required',
                'integer',
                'exists:users,id',
            ],
        ]);

        $transaction = DB::transaction(function () use ($validated) {

            $item = Item::where('item_id', $validated['item_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $quantity = $validated['quantity'];

            switch ($validated['transaction_type']) {
                case 'receiving':
                case 'transfer_in':
                case 'return':
                    $item->current_stock += $quantity;
                    break;

                case 'issuing':
                case 'transfer_out':
                    if ($item->current_stock < $quantity) {
                        throw ValidationException::withMessages([
                            'quantity' => [
                                'Insufficient stock for this transaction.',
                            ],
                        ]);
                    }

                    $item->current_stock -= $quantity;
                    break;

                case 'adjustment':
                    /*
                     * Adjustment is currently treated as an
                     * increase/decrease transaction based on
                     * the supplied quantity.
                     *
                     * Positive quantity increases stock.
                     */
                    $item->current_stock += $quantity;
                    break;
            }

            $item->save();

            return InventoryTransaction::create($validated);
        });

        $transaction->load([
            'item',
            'warehouse',
            'performedBy',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inventory transaction created successfully.',
            'data' => $transaction,
        ], 201);
    }

    /**
     * Display a specific inventory transaction.
     */
    public function show(InventoryTransaction $inventoryTransaction)
    {
        $inventoryTransaction->load([
            'item',
            'warehouse',
            'performedBy',
        ]);

        return response()->json([
            'success' => true,
            'data' => $inventoryTransaction,
        ]);
    }

    /**
     * Update an inventory transaction.
     */
/**
 * Update an inventory transaction.
 */
public function update(
    Request $request,
    InventoryTransaction $inventoryTransaction
) {
    $validated = $request->validate([
        'item_id' => [
            'sometimes',
            'required',
            'integer',
            'exists:items,item_id',
        ],
        'warehouse_id' => [
            'sometimes',
            'required',
            'integer',
            'exists:warehouses,warehouse_id',
        ],
        'transaction_type' => [
            'sometimes',
            'required',
            'string',
            'in:receiving,issuing,adjustment,transfer_in,transfer_out,return',
        ],
        'quantity' => [
            'sometimes',
            'required',
            'integer',
            'min:1',
        ],
        'reference_no' => [
            'nullable',
            'string',
            'max:100',
        ],
        'transaction_date' => [
            'sometimes',
            'required',
            'date',
        ],
        'performed_by' => [
            'sometimes',
            'required',
            'integer',
            'exists:users,id',
        ],
    ]);

    DB::transaction(function () use (
        $validated,
        $inventoryTransaction
    ) {
        $oldItem = Item::where('item_id', $inventoryTransaction->item_id)
            ->lockForUpdate()
            ->firstOrFail();

        /*
         * Reverse the effect of the old transaction.
         */
        switch ($inventoryTransaction->transaction_type) {
            case 'receiving':
            case 'transfer_in':
            case 'return':
                $oldItem->current_stock -= $inventoryTransaction->quantity;
                break;

            case 'issuing':
            case 'transfer_out':
                $oldItem->current_stock += $inventoryTransaction->quantity;
                break;

            case 'adjustment':
                $oldItem->current_stock -= $inventoryTransaction->quantity;
                break;
        }

        $oldItem->save();

        /*
         * Update the transaction.
         */
        $inventoryTransaction->update($validated);

        /*
         * Apply the new transaction effect.
         */
        $newItem = Item::where('item_id', $inventoryTransaction->item_id)
            ->lockForUpdate()
            ->firstOrFail();

        $quantity = $inventoryTransaction->quantity;

        switch ($inventoryTransaction->transaction_type) {
            case 'receiving':
            case 'transfer_in':
            case 'return':
                $newItem->current_stock += $quantity;
                break;

            case 'issuing':
            case 'transfer_out':
                if ($newItem->current_stock < $quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => [
                            'Insufficient stock for this transaction.',
                        ],
                    ]);
                }

                $newItem->current_stock -= $quantity;
                break;

            case 'adjustment':
                $newItem->current_stock += $quantity;
                break;
        }

        $newItem->save();
    });

    $inventoryTransaction->load([
        'item',
        'warehouse',
        'performedBy',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Inventory transaction updated successfully.',
        'data' => $inventoryTransaction,
    ]);
}

/**
 * Delete an inventory transaction.
 */
public function destroy(InventoryTransaction $inventoryTransaction)
{
    DB::transaction(function () use ($inventoryTransaction) {

        $item = Item::where('item_id', $inventoryTransaction->item_id)
            ->lockForUpdate()
            ->firstOrFail();

        /*
         * Reverse the inventory effect before deleting
         * the transaction.
         */
        switch ($inventoryTransaction->transaction_type) {
            case 'receiving':
            case 'transfer_in':
            case 'return':
                if ($item->current_stock < $inventoryTransaction->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => [
                            'Cannot delete this transaction because it would result in negative stock.',
                        ],
                    ]);
                }

                $item->current_stock -= $inventoryTransaction->quantity;
                break;

            case 'issuing':
            case 'transfer_out':
                $item->current_stock += $inventoryTransaction->quantity;
                break;

            case 'adjustment':
                $item->current_stock -= $inventoryTransaction->quantity;
                break;
        }

        $item->save();

        $inventoryTransaction->delete();
    });

    return response()->json([
        'success' => true,
        'message' => 'Inventory transaction deleted successfully.',
    ]);
}
}