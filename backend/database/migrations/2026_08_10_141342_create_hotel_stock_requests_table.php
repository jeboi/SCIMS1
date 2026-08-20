<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_stock_requests', function (Blueprint $table) {
            $table->id('stock_request_id');

            $table->foreignId('department_id')
                ->constrained('hotel_departments', 'department_id')
                ->cascadeOnDelete();

            $table->unsignedBigInteger('requested_by');

            $table->date('request_date');

            $table->string('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_stock_requests');
    }
};