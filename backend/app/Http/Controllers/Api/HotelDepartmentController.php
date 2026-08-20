<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HotelDepartment;
use Illuminate\Http\Request;

class HotelDepartmentController extends Controller
{
    public function index()
    {
        $departments = HotelDepartment::with('stockRequests')->get();

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $department = HotelDepartment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hotel department created successfully.',
            'data' => $department,
        ], 201);
    }

    public function show(HotelDepartment $hotelDepartment)
    {
        $hotelDepartment->load('stockRequests');

        return response()->json([
            'success' => true,
            'data' => $hotelDepartment,
        ]);
    }

    public function update(
        Request $request,
        HotelDepartment $hotelDepartment
    ) {
        $validated = $request->validate([
            'department_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
        ]);

        $hotelDepartment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hotel department updated successfully.',
            'data' => $hotelDepartment,
        ]);
    }

    public function destroy(HotelDepartment $hotelDepartment)
    {
        $hotelDepartment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hotel department deleted successfully.',
        ]);
    }
}