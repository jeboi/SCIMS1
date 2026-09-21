<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and issue Sanctum token.
     */
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required'],
            ]);

            if (! Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            $user = Auth::user();

            // Revoke any existing tokens for this user
            $user->tokens()->delete();

            $token = $user->createToken('scims-api-token')->plainTextToken;

            // Get user permissions
            $permissions = $this->getUserPermissions($user);

            return response()->json([
                'success' => true,
                'message' => 'Login successful.',
                'user' => $user->load('role'),
                'token' => $token,
                'permissions' => $permissions,
                'token_type' => 'Bearer',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the currently authenticated user.
     */
    public function user(Request $request)
    {
        try {
            // Explicitly use sanctum guard
            $user = $request->user('sanctum') ?? auth('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get user permissions
            $permissions = $this->getUserPermissions($user);

            return response()->json([
                'success' => true,
                'authenticated' => true,
                'user' => $user->load('role'),
                'permissions' => $permissions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user by revoking ALL of the user's tokens.
     */
    public function logout(Request $request)
    {
        try {
            // Explicitly use sanctum guard
            $user = $request->user('sanctum') ?? auth('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated.',
                ], 401);
            }

            // Delete ALL tokens for this user (guarantees full logout)
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user permissions based on role.
     */
    private function getUserPermissions($user)
    {
        try {
            // If user is admin (role_id = 1), return all permissions
            if ((int) $user->role_id === 1) {
                return $this->getAllPermissions();
            }

            // If user has a role_id, get permissions from role
            if ($user->role_id) {
                $role = Role::find($user->role_id);
                if ($role) {
                    // Check if role has permissions relationship (using rolePermissions method)
                    if (method_exists($role, 'rolePermissions')) {
                        return $role->rolePermissions()->pluck('permission')->toArray();
                    }

                    // If using Spatie Permission package
                    if (method_exists($role, 'permissions')) {
                        return $role->permissions()->pluck('name')->toArray();
                    }
                }
            }

            return [];
        } catch (\Exception $e) {
            // If there's an error getting permissions, return empty array
            return [];
        }
    }

    /**
     * Get all possible permissions for admin users.
     */
    private function getAllPermissions()
    {
        // Define all modules and their actions
        $modules = [
            'dashboard' => ['view'],
            'warehousing' => ['view', 'create', 'edit', 'delete'],
            'inventory' => ['view', 'create', 'edit', 'delete', 'adjust'],
            'procurement' => ['view', 'create', 'edit', 'delete', 'approve'],
            'suppliers' => ['view', 'create', 'edit', 'delete', 'evaluate'],
            'purchase_orders' => ['view', 'create', 'edit', 'delete', 'approve'],
            'logistics' => ['view', 'create', 'edit', 'delete'],
            'reports' => ['view', 'create', 'export'],
            'users' => ['view', 'create', 'edit', 'delete'],
            'roles' => ['view', 'create', 'edit', 'delete'],
            'permissions' => ['view', 'assign']
        ];

        $permissions = [];
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permissions[] = "{$module}.{$action}";
            }
        }

        return $permissions;
    }
}