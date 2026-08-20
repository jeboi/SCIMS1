<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogisticsDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogisticsDocumentController extends Controller
{
    /**
     * Display all logistics documents.
     */
    public function index()
    {
        $documents = LogisticsDocument::with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Store a new logistics document.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_number' => 'required|string|max:100|unique:logistics_documents',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,pending,approved,archived,rejected',
            'document_date' => 'nullable|date',
            'reference_id' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:255',
            'items' => 'nullable|integer|min:0',
            'file_path' => 'nullable|string|max:500',
        ]);

        $validated['created_by'] = Auth::id();

        $document = LogisticsDocument::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Document created successfully.',
            'data' => $document,
        ], 201);
    }

    /**
     * Display a specific logistics document.
     */
    public function show(LogisticsDocument $logisticsDocument)
    {
        $logisticsDocument->load('creator');

        return response()->json([
            'success' => true,
            'data' => $logisticsDocument,
        ]);
    }

    /**
     * Update a logistics document.
     */
    public function update(Request $request, LogisticsDocument $logisticsDocument)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'document_number' => 'sometimes|required|string|max:100|unique:logistics_documents,document_number,' . $logisticsDocument->document_id . ',document_id',
            'category' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string|in:draft,pending,approved,archived,rejected',
            'document_date' => 'nullable|date',
            'reference_id' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:255',
            'items' => 'nullable|integer|min:0',
            'file_path' => 'nullable|string|max:500',
        ]);

        $logisticsDocument->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Document updated successfully.',
            'data' => $logisticsDocument,
        ]);
    }

    /**
     * Update document status only.
     */
    public function updateStatus(Request $request, LogisticsDocument $logisticsDocument)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:draft,pending,approved,archived,rejected',
        ]);

        $logisticsDocument->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Document status updated successfully.',
            'data' => $logisticsDocument,
        ]);
    }

    /**
     * Delete a logistics document.
     */
    public function destroy(LogisticsDocument $logisticsDocument)
    {
        $logisticsDocument->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully.',
        ]);
    }
}