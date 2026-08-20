<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
    $table->id('warehouse_id');
    $table->string('warehouse_name');
    $table->string('location');
    $table->integer('capacity');
    $table->enum('status', ['active', 'inactive'])
        ->default('active');
});
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};