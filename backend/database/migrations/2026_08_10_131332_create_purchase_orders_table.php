<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id('po_id');

            $table->foreignId('supplier_id')
                ->constrained('suppliers', 'supplier_id')
                ->restrictOnDelete();

            $table->foreignId('request_id')
                ->constrained('purchase_requests', 'request_id')
                ->restrictOnDelete();

            $table->string('po_number')->unique();
            $table->date('po_date');
            $table->string('status');
            $table->date('expected_delivery')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};