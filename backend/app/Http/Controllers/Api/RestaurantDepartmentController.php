<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantDepartment;
use Illuminate\Http\Request;

class RestaurantDepartmentController extends Controller
{
    /**
     * Display all restaurant departments.
     */
    public function index()
    {
        $departments = RestaurantDepartment::with([
            'stockRequests.details.item',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    /**
     * Store a new restaurant department.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        $department = RestaurantDepartment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant department created successfully.',
            'data' => $department,
        ], 201);
    }

    /**
     * Display a specific restaurant department.
     */
    public function show(RestaurantDepartment $restaurantDepartment)
    {
        $restaurantDepartment->load([
            'stockRequests.details.item',
        ]);

        return response()->json([
            'success' => true,
            'data' => $restaurantDepartment,
        ]);
    }

    /**
     * Update a restaurant department.
     */
    public function update(
        Request $request,
        RestaurantDepartment $restaurantDepartment
    ) {
        $validated = $request->validate([
            'department_name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
        ]);

        $restaurantDepartment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant department updated successfully.',
            'data' => $restaurantDepartment,
        ]);
    }

    /**
     * Delete a restaurant department.
     */
    public function destroy(RestaurantDepartment $restaurantDepartment)
    {
        $restaurantDepartment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Restaurant department deleted successfully.',
        ]);
    }
}