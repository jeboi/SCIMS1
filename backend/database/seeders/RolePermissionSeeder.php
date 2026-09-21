<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RolePermission;
use App\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Get the Administrator role (usually ID 1)
        $adminRole = Role::where('name', 'Administrator')->first();
        
        if ($adminRole) {
            // Add some permissions for Administrator
            $permissions = [
                'dashboard_view',
                'users_view',
                'users_create',
                'users_edit',
                'users_delete',
                'roles_view',
                'roles_create',
                'roles_edit',
                'roles_delete',
                'inventory_view',
                'inventory_create',
                'inventory_edit',
                'inventory_delete',
                'reports_view',
                'reports_create',
                'reports_export',
            ];
            
            foreach ($permissions as $permission) {
                RolePermission::create([
                    'role_id' => $adminRole->id,
                    'permission' => $permission,
                ]);
            }
            
            $this->command->info('Permissions added for Administrator role');
        }
    }
}