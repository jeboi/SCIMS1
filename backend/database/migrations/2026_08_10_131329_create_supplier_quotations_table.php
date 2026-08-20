<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_quotations', function (Blueprint $table) {
            $table->id('quotation_id');

            $table->foreignId('supplier_id')
                ->constrained('suppliers', 'supplier_id')
                ->restrictOnDelete();

            $table->string('quotation_no');
            $table->date('quotation_date');
            $table->string('status');

            $table->timestamps();

            $table->unique(['supplier_id', 'quotation_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_quotations');
    }
};