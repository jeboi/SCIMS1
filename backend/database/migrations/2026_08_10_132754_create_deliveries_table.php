<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->bigIncrements('delivery_id');

            $table->unsignedBigInteger('po_id');
            $table->string('tracking_number');
            $table->string('vehicle');
            $table->date('delivery_date');
            $table->string('status');

            $table->foreign('po_id')
                ->references('po_id')
                ->on('purchase_orders')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};