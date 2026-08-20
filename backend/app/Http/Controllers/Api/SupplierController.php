<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display all suppliers.
     */
    public function index()
    {
        $suppliers = Supplier::with([
            'quotations',
            'purchaseOrders',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $suppliers,
        ]);
    }

    /**
     * Store a new supplier.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => [
                'required',
                'string',
                'max:255',
            ],
            'contact_person' => [
                'nullable',
                'string',
                'max:255',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'address' => [
                'nullable',
                'string',
            ],
            'status' => [
                'required',
                'string',
                'max:50',
            ],
            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:5',
            ],
        ]);

        $supplier = Supplier::create($validated);

        $supplier->load([
            'quotations',
            'purchaseOrders',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Supplier created successfully.',
            'data' => $supplier,
        ], 201);
    }

    /**
     * Display a specific supplier.
     */
    public function show(Supplier $supplier)
    {
        $supplier->load([
            'quotations',
            'purchaseOrders',
        ]);

        return response()->json([
            'success' => true,
            'data' => $supplier,
        ]);
    }

    /**
     * Update a supplier.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'supplier_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'contact_person' => [
                'nullable',
                'string',
                'max:255',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'address' => [
                'nullable',
                'string',
            ],
            'status' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],
            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:5',
            ],
        ]);

        $supplier->update($validated);

        $supplier->load([
            'quotations',
            'purchaseOrders',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Supplier updated successfully.',
            'data' => $supplier,
        ]);
    }

    /**
     * Delete a supplier.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Supplier deleted successfully.',
        ]);
    }
}