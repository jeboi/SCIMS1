<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('storage_locations', function (Blueprint $table) {
            $table->string('location_name')->nullable()->after('location_code');
            $table->string('zone')->nullable()->after('location_name');
            $table->string('aisle')->nullable()->after('zone');
            $table->string('shelf')->nullable()->after('aisle');
            $table->integer('capacity')->default(0)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('storage_locations', function (Blueprint $table) {
            $table->dropColumn(['location_name', 'zone', 'aisle', 'shelf', 'capacity']);
        });
    }
};