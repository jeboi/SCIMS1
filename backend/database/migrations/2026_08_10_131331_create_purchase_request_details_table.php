<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_request_details', function (Blueprint $table) {
            $table->id('pr_detail_id');

            $table->foreignId('request_id')
                ->constrained('purchase_requests', 'request_id')
                ->cascadeOnDelete();

            $table->foreignId('item_id')
                ->constrained('items', 'item_id')
                ->restrictOnDelete();

            $table->integer('quantity');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_request_details');
    }
};