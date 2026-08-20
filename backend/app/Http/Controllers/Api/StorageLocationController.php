<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorageLocation;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class StorageLocationController extends Controller
{
    /**
     * Display all storage locations.
     */
    public function index()
    {
        $locations = StorageLocation::with('warehouse')->get();

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }

    /**
     * Store a new storage location.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,warehouse_id',
            ],
            'location_code' => [
                'required',
                'string',
                'max:100',
            ],
            'location_name' => [
                'required',
                'string',
                'max:255',
            ],
            'zone' => [
                'nullable',
                'string',
                'max:50',
            ],
            'aisle' => [
                'nullable',
                'string',
                'max:50',
            ],
            'shelf' => [
                'nullable',
                'string',
                'max:50',
            ],
            'bin' => [
                'nullable',
                'string',
                'max:50',
            ],
            'rack' => [
                'required',
                'string',
                'max:100',
            ],
            'capacity' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'status' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $location = StorageLocation::create($validated);

        $location->load('warehouse');

        return response()->json([
            'success' => true,
            'message' => 'Storage location created successfully.',
            'data' => $location,
        ], 201);
    }

    /**
     * Display a specific storage location.
     */
    public function show(StorageLocation $storageLocation)
    {
        $storageLocation->load('warehouse');

        return response()->json([
            'success' => true,
            'data' => $storageLocation,
        ]);
    }

    /**
     * Update a storage location.
     */
    public function update(Request $request, StorageLocation $storageLocation)
    {
        $validated = $request->validate([
            'warehouse_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:warehouses,warehouse_id',
            ],
            'location_code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'location_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'zone' => [
                'nullable',
                'string',
                'max:50',
            ],
            'aisle' => [
                'nullable',
                'string',
                'max:50',
            ],
            'shelf' => [
                'nullable',
                'string',
                'max:50',
            ],
            'bin' => [
                'nullable',
                'string',
                'max:50',
            ],
            'rack' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'capacity' => [
                'nullable',
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

        $storageLocation->update($validated);

        $storageLocation->load('warehouse');

        return response()->json([
            'success' => true,
            'message' => 'Storage location updated successfully.',
            'data' => $storageLocation,
        ]);
    }

    /**
     * Delete a storage location.
     */
    public function destroy(StorageLocation $storageLocation)
    {
        $storageLocation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Storage location deleted successfully.',
        ]);
    }
}