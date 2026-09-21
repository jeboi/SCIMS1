<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'description',
        'guard_name',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Get the permissions for this role.
     * Uses the role_permissions table.
     */
    public function rolePermissions()
    {
        return $this->hasMany(RolePermission::class, 'role_id');
    }

    /**
     * Get all permission names for this role.
     */
    public function getPermissionsAttribute()
    {
        return $this->rolePermissions()->pluck('permission')->toArray();
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission($permission)
    {
        return $this->rolePermissions()->where('permission', $permission)->exists();
    }

    /**
     * Check if role has any of the given permissions.
     */
    public function hasAnyPermission($permissions)
    {
        return $this->rolePermissions()->whereIn('permission', $permissions)->exists();
    }

    /**
     * Check if role has all of the given permissions.
     */
    public function hasAllPermissions($permissions)
    {
        $count = $this->rolePermissions()->whereIn('permission', $permissions)->count();
        return $count === count($permissions);
    }

    /**
     * Sync permissions for this role.
     * Removes old permissions and adds new ones.
     */
    public function syncPermissions(array $permissions)
    {
        // Delete existing permissions
        $this->rolePermissions()->delete();
        
        // Add new permissions
        foreach ($permissions as $permission) {
            RolePermission::create([
                'role_id' => $this->id,
                'permission' => $permission,
            ]);
        }
        
        return $this;
    }

    /**
     * Give permission to this role.
     */
    public function givePermissionTo($permission)
    {
        if (!$this->hasPermission($permission)) {
            RolePermission::create([
                'role_id' => $this->id,
                'permission' => $permission,
            ]);
        }
        
        return $this;
    }

    /**
     * Remove permission from this role.
     */
    public function revokePermissionTo($permission)
    {
        $this->rolePermissions()->where('permission', $permission)->delete();
        return $this;
    }
}