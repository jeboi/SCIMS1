<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_order_details', function (Blueprint $table) {
            $table->id('po_detail_id');

            $table->foreignId('po_id')
                ->constrained('purchase_orders', 'po_id')
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained('items', 'item_id')
                ->restrictOnDelete();

            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_details');
    }
};