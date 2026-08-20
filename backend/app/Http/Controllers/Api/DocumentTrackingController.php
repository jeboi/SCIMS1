<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentTrackingController extends Controller
{
    /**
     * Display all tracking records.
     */
    public function index()
    {
        $tracking = DocumentTracking::with(['document', 'updatedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tracking,
        ]);
    }

    /**
     * Get tracking history for a specific document.
     */
    public function getByDocument($documentId)
    {
        $tracking = DocumentTracking::with(['updatedBy'])
            ->where('document_id', $documentId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tracking,
        ]);
    }

    /**
     * Store a new tracking record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_id' => 'required|exists:logistics_documents,document_id',
            'status' => 'required|string|max:50',
            'location' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $validated['updated_by'] = Auth::id();
        $validated['status_date'] = now();

        $tracking = DocumentTracking::create($validated);

        // Update the parent document status
        $tracking->document()->update([
            'status' => $validated['status'],
            'location' => $validated['location'] ?? null,
            'updated_at' => now(),
        ]);

        $tracking->load(['document', 'updatedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Tracking record created successfully.',
            'data' => $tracking,
        ], 201);
    }

    /**
     * Display a specific tracking record.
     */
    public function show(DocumentTracking $documentTracking)
    {
        $documentTracking->load(['document', 'updatedBy']);

        return response()->json([
            'success' => true,
            'data' => $documentTracking,
        ]);
    }

    /**
     * Delete a tracking record.
     */
    public function destroy(DocumentTracking $documentTracking)
    {
        $documentTracking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tracking record deleted successfully.',
        ]);
    }
}