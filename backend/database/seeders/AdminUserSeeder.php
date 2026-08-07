<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            [
                'email' => 'admin@scims.com',
            ],
            [
                'name' => 'System Administrator',
                'password' => bcrypt('Admin@123'),
            ]
        );

        $admin->assignRole('Administrator');
    }
}