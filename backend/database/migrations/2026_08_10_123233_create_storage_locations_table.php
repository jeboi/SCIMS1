<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storage_locations', function (Blueprint $table) {
    $table->id('location_id');

    $table->foreignId('warehouse_id')
        ->constrained('warehouses', 'warehouse_id')
        ->cascadeOnDelete();

    $table->string('location_code');
    $table->string('rack');
    $table->string('bin');
    $table->enum('status', ['active', 'inactive'])
        ->default('active');

    $table->unique(['warehouse_id', 'location_code']);
});
    }

    public function down(): void
    {
        Schema::dropIfExists('storage_locations');
    }
};