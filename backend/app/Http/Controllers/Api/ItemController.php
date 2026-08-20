<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    /**
     * Display all items.
     */
    public function index(Request $request)
{
    $query = Item::with('category');

    // Search by barcode or item name
    if ($request->has('search')) {
        $search = $request->input('search');
        $query->where(function ($q) use ($search) {
            $q->where('barcode', 'ILIKE', "%{$search}%")
              ->orWhere('item_name', 'ILIKE', "%{$search}%");
        });
    }

    // Exact barcode match (for scanning)
    if ($request->has('barcode')) {
        $barcode = $request->input('barcode');
        $query->where('barcode', $barcode);
    }

    $items = $query->get();

    return response()->json([
        'success' => true,
        'data' => $items,
    ]);
}

    /**
     * Store a new item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => [
                'required',
                'integer',
                'exists:categories,category_id',
            ],
            'barcode' => [
                'required',
                'string',
                'max:100',
                'unique:items,barcode',
            ],
            'item_name' => [
                'required',
                'string',
                'max:255',
            ],
            'unit' => [
                'required',
                'string',
                'max:50',
            ],
            'reorder_level' => [
                'required',
                'integer',
                'min:0',
            ],
            'current_stock' => [
                'required',
                'integer',
                'min:0',
            ],
            'status' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $item = Item::create($validated);

        $item->load([
            'category',
            'inventoryTransactions.warehouse',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully.',
            'data' => $item,
        ], 201);
    }

    /**
     * Display a specific item.
     */
    public function show(Item $item)
    {
        $item->load([
            'category',
            'inventoryTransactions.warehouse',
        ]);

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Update an item.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:categories,category_id',
            ],
            'barcode' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                'unique:items,barcode,' . $item->item_id . ',item_id',
            ],
            'item_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'unit' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],
            'reorder_level' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],
            'status' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],
        ]);

        $item->update($validated);

        $item->load([
            'category',
            'inventoryTransactions.warehouse',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully.',
            'data' => $item,
        ]);
    }

    /**
     * Delete an item.
     */
    public function destroy(Item $item)
    {
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully.',
        ]);
    }
}