<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    /**
     * Display all warehouses.
     */
    public function index()
    {
        $warehouses = Warehouse::with([
            'storageLocations',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $warehouses,
        ]);
    }

    /**
     * Store a new warehouse.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'warehouse_name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
        ]);

        $warehouse = Warehouse::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Warehouse created successfully.',
            'data' => $warehouse,
        ], 201);
    }

    /**
     * Display a specific warehouse.
     */
    public function show(Warehouse $warehouse)
    {
        $warehouse->load([
            'storageLocations',
            'inventoryTransactions.item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $warehouse,
        ]);
    }

    /**
     * Update a warehouse.
     */
    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'warehouse_name' => ['sometimes', 'required', 'string', 'max:255'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:0'],
            'status' => ['sometimes', 'required', 'string', 'max:50'],
        ]);

        $warehouse->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Warehouse updated successfully.',
            'data' => $warehouse->fresh(),
        ]);
    }

    /**
     * Delete a warehouse.
     */
    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();

        return response()->json([
            'success' => true,
            'message' => 'Warehouse deleted successfully.',
        ]);
    }
}