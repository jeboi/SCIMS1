<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receiving_records', function (Blueprint $table) {
            $table->bigIncrements('receiving_id');

            $table->unsignedBigInteger('delivery_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->string('received_by');
            $table->date('received_date');
            $table->text('remarks')->nullable();

            $table->foreign('delivery_id')
                ->references('delivery_id')
                ->on('deliveries')
                ->restrictOnDelete();

            $table->foreign('warehouse_id')
                ->references('warehouse_id')
                ->on('warehouses')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receiving_records');
    }
};