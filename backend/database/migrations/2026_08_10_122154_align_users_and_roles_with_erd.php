<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->nullable()
                ->after('id')
                ->constrained('roles')
                ->nullOnDelete();

            $table->string('first_name')
                ->nullable()
                ->after('name');

            $table->string('last_name')
                ->nullable()
                ->after('first_name');

            $table->string('status')
                ->default('active')
                ->after('password');
        });

        /*
         * Preserve the existing administrator account.
         *
         * The current user is already assigned to the
         * Administrator role through Spatie's model_has_roles.
         * We mirror that role assignment into users.role_id
         * so the users table also follows the ERD.
         */
        \DB::table('users')
            ->where('id', 1)
            ->update([
                'role_id' => 1,
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'status' => 'active',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn([
                'role_id',
                'first_name',
                'last_name',
                'status',
            ]);
        });
    }
};