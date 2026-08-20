<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
    $table->id('item_id');

    $table->foreignId('category_id')
        ->constrained('categories', 'category_id')
        ->restrictOnDelete();

    $table->string('barcode')->nullable()->unique();
    $table->string('item_name');
    $table->string('unit');
    $table->integer('reorder_level')->default(0);
    $table->integer('current_stock')->default(0);

    $table->enum('status', ['active', 'inactive'])
        ->default('active');
});    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};