<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_stock_request_details', function (Blueprint $table) {
            $table->id('detail_id');
            $table->foreignId('request_id')->constrained('restaurant_stock_requests', 'request_id')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items', 'item_id')->cascadeOnDelete();
            $table->integer('quantity_requested');
            $table->integer('quantity_fulfilled')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_stock_request_details');
    }
};