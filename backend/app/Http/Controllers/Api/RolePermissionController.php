<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RolePermissionController extends Controller
{
    /**
     * Get permissions for a specific role.
     */
    public function getPermissions($roleId)
    {
        try {
            $role = Role::findOrFail($roleId);
            
            // Get permissions from the role_permissions table
            $permissions = $role->rolePermissions()->pluck('permission')->toArray();
            
            return response()->json([
                'data' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'message' => 'Error fetching permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update permissions for a specific role.
     */
    public function updatePermissions(Request $request, $roleId)
    {
        try {
            $role = Role::findOrFail($roleId);
            $permissions = $request->permissions ?? [];
            
            // Use the syncPermissions method from the Role model
            $role->syncPermissions($permissions);
            
            // Get updated permissions
            $updatedPermissions = $role->rolePermissions()->pluck('permission')->toArray();
            
            return response()->json([
                'message' => 'Permissions updated successfully',
                'data' => $updatedPermissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Give a specific permission to a role.
     */
    public function givePermission(Request $request, $roleId)
    {
        try {
            $request->validate([
                'permission' => 'required|string'
            ]);

            $role = Role::findOrFail($roleId);
            $permission = $request->permission;
            
            // Check if permission already exists
            if ($role->hasPermission($permission)) {
                return response()->json([
                    'message' => 'Permission already exists for this role',
                    'data' => $role->rolePermissions()->pluck('permission')->toArray()
                ], 200);
            }
            
            // Add the permission
            $role->givePermissionTo($permission);
            
            return response()->json([
                'message' => 'Permission granted successfully',
                'data' => $role->rolePermissions()->pluck('permission')->toArray()
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error granting permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Revoke a specific permission from a role.
     */
    public function revokePermission(Request $request, $roleId)
    {
        try {
            $request->validate([
                'permission' => 'required|string'
            ]);

            $role = Role::findOrFail($roleId);
            $permission = $request->permission;
            
            // Check if permission exists
            if (!$role->hasPermission($permission)) {
                return response()->json([
                    'message' => 'Permission does not exist for this role',
                    'data' => $role->rolePermissions()->pluck('permission')->toArray()
                ], 404);
            }
            
            // Remove the permission
            $role->revokePermissionTo($permission);
            
            return response()->json([
                'message' => 'Permission revoked successfully',
                'data' => $role->rolePermissions()->pluck('permission')->toArray()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error revoking permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all available permissions (for reference).
     */
    public function getAllAvailablePermissions()
    {
        try {
            // Define all modules and their actions
            $modules = [
                'dashboard',
                'warehousing',
                'inventory',
                'procurement',
                'suppliers',
                'purchase_orders',
                'logistics',
                'reports',
                'users',
                'roles',
                'permissions'
            ];
            
            $actions = ['view', 'create', 'edit', 'delete', 'approve', 'evaluate', 'generate', 'export', 'assign', 'adjust'];
            
            $permissions = [];
            foreach ($modules as $module) {
                foreach ($actions as $action) {
                    $permissions[] = "{$module}.{$action}";
                }
            }
            
            return response()->json([
                'data' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching available permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions grouped by module.
     */
    public function getPermissionsGrouped()
    {
        try {
            $modules = [
                'dashboard' => ['view'],
                'warehousing' => ['view', 'create', 'edit', 'delete'],
                'inventory' => ['view', 'create', 'edit', 'delete', 'adjust'],
                'procurement' => ['view', 'create', 'edit', 'delete', 'approve'],
                'suppliers' => ['view', 'create', 'edit', 'delete', 'evaluate'],
                'purchase_orders' => ['view', 'create', 'edit', 'delete', 'approve'],
                'logistics' => ['view', 'create', 'edit', 'delete'],
                'reports' => ['view', 'generate', 'export'],
                'users' => ['view', 'create', 'edit', 'delete'],
                'roles' => ['view', 'create', 'edit', 'delete'],
                'permissions' => ['view', 'assign']
            ];
            
            $grouped = [];
            foreach ($modules as $module => $actions) {
                $grouped[$module] = [
                    'module' => $module,
                    'actions' => $actions,
                    'permissions' => array_map(function($action) use ($module) {
                        return "{$module}.{$action}";
                    }, $actions)
                ];
            }
            
            return response()->json([
                'data' => $grouped
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching grouped permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}