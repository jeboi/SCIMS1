<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupplierQuotation;
use Illuminate\Http\Request;

class SupplierQuotationController extends Controller
{
    /**
     * Display all supplier quotations.
     */
    public function index()
    {
        $quotations = SupplierQuotation::with('supplier')->get();

        return response()->json([
            'success' => true,
            'data' => $quotations,
        ]);
    }

    /**
     * Store a new supplier quotation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => [
                'required',
                'integer',
                'exists:suppliers,supplier_id',
            ],
            'quotation_no' => [
                'required',
                'string',
                'max:100',
            ],
            'quotation_date' => [
                'required',
                'date',
            ],
            'status' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $quotation = SupplierQuotation::create($validated);

        $quotation->load('supplier');

        return response()->json([
            'success' => true,
            'message' => 'Supplier quotation created successfully.',
            'data' => $quotation,
        ], 201);
    }

    /**
     * Display a specific supplier quotation.
     */
    public function show(SupplierQuotation $supplierQuotation)
    {
        $supplierQuotation->load('supplier');

        return response()->json([
            'success' => true,
            'data' => $supplierQuotation,
        ]);
    }

    /**
     * Update a supplier quotation.
     */
    public function update(
        Request $request,
        SupplierQuotation $supplierQuotation
    ) {
        $validated = $request->validate([
            'supplier_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:suppliers,supplier_id',
            ],
            'quotation_no' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'quotation_date' => [
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

        $supplierQuotation->update($validated);

        $supplierQuotation->load('supplier');

        return response()->json([
            'success' => true,
            'message' => 'Supplier quotation updated successfully.',
            'data' => $supplierQuotation,
        ]);
    }

    /**
     * Delete a supplier quotation.
     */
    public function destroy(SupplierQuotation $supplierQuotation)
    {
        $supplierQuotation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Supplier quotation deleted successfully.',
        ]);
    }
}