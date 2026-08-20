<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_items', function (Blueprint $table) {
            $table->bigIncrements('delivery_item_id');

            $table->unsignedBigInteger('delivery_id');
            $table->unsignedBigInteger('item_id');
            $table->integer('quantity_received');

            $table->foreign('delivery_id')
                ->references('delivery_id')
                ->on('deliveries')
                ->cascadeOnDelete();

            $table->foreign('item_id')
                ->references('item_id')
                ->on('items')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_items');
    }
};