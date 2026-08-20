<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
    $table->id('transaction_id');

    $table->foreignId('item_id')
        ->constrained('items', 'item_id')
        ->restrictOnDelete();

    $table->foreignId('warehouse_id')
        ->constrained('warehouses', 'warehouse_id')
        ->restrictOnDelete();

    $table->enum('transaction_type', [
        'receiving',
        'issuing',
        'adjustment',
        'transfer_in',
        'transfer_out',
        'return',
    ]);

    $table->integer('quantity');

    $table->string('reference_no')->nullable();

    $table->timestamp('transaction_date')->useCurrent();

    $table->foreignId('performed_by')
        ->nullable()
        ->constrained('users', 'id')
        ->nullOnDelete();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};