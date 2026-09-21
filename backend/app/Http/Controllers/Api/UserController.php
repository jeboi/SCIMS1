<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::select('users.*')
                ->where('email', '!=', 'test@scims.com') // Exclude test user
                ->orderBy('users.created_at', 'desc');
            
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('users.name', 'ILIKE', "%{$search}%")
                      ->orWhere('users.email', 'ILIKE', "%{$search}%");
                });
            }
            
            $users = $query->paginate($request->limit ?? 10);
            
            return response()->json([
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'last_page' => $users->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                'role_id' => 'nullable|exists:roles,id',
                'status' => 'nullable|in:active,inactive',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_id' => $validated['role_id'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'first_name' => $validated['first_name'] ?? null,
                'last_name' => $validated['last_name'] ?? null,
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::where('id', $id)->where('email', '!=', 'test@scims.com')->firstOrFail();
            return response()->json(['data' => $user]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::where('id', $id)->where('email', '!=', 'test@scims.com')->firstOrFail();
            
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'password' => 'nullable|string|min:8',
                'role_id' => 'nullable|exists:roles,id',
                'status' => 'nullable|in:active,inactive',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
            ]);

            if (isset($validated['password']) && !empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'message' => 'User updated successfully',
                'data' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::where('id', $id)->where('email', '!=', 'test@scims.com')->firstOrFail();
            
            if ($user->id === auth()->id()) {
                return response()->json([
                    'message' => 'Cannot delete your own account'
                ], 403);
            }
            
            $user->delete();
            
            return response()->json([
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}