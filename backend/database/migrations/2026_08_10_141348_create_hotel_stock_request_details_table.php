<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_stock_request_details', function (Blueprint $table) {
            $table->id('stock_request_detail_id');

            $table->foreignId('stock_request_id')
                ->constrained('hotel_stock_requests', 'stock_request_id')
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained('items', 'item_id')
                ->restrictOnDelete();

            $table->integer('quantity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_stock_request_details');
    }
};