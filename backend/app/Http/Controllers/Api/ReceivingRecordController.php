<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReceivingRecord;
use Illuminate\Http\Request;

class ReceivingRecordController extends Controller
{
    /**
     * Display all receiving records.
     */
    public function index()
    {
        $receivingRecords = ReceivingRecord::with([
            'delivery',
            'warehouse',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $receivingRecords,
        ]);
    }

    /**
     * Store a new receiving record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'delivery_id' => [
                'required',
                'integer',
                'exists:deliveries,delivery_id',
            ],
            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,warehouse_id',
            ],
            'received_by' => [
                'required',
                'string',
                'max:255',
            ],
            'received_date' => [
                'required',
                'date',
            ],
            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        $receivingRecord = ReceivingRecord::create($validated);

        $receivingRecord->load([
            'delivery',
            'warehouse',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receiving record created successfully.',
            'data' => $receivingRecord,
        ], 201);
    }

    /**
     * Display a specific receiving record.
     */
    public function show(ReceivingRecord $receivingRecord)
    {
        $receivingRecord->load([
            'delivery',
            'warehouse',
        ]);

        return response()->json([
            'success' => true,
            'data' => $receivingRecord,
        ]);
    }

    /**
     * Update a receiving record.
     */
    public function update(
        Request $request,
        ReceivingRecord $receivingRecord
    ) {
        $validated = $request->validate([
            'delivery_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:deliveries,delivery_id',
            ],
            'warehouse_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:warehouses,warehouse_id',
            ],
            'received_by' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'received_date' => [
                'sometimes',
                'required',
                'date',
            ],
            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        $receivingRecord->update($validated);

        $receivingRecord->load([
            'delivery',
            'warehouse',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receiving record updated successfully.',
            'data' => $receivingRecord,
        ]);
    }

    /**
     * Delete a receiving record.
     */
    public function destroy(ReceivingRecord $receivingRecord)
    {
        $receivingRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Receiving record deleted successfully.',
        ]);
    }
}