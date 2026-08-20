<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_tracking', function (Blueprint $table) {
            $table->id('tracking_id');
            $table->foreignId('document_id')->constrained('logistics_documents', 'document_id')->cascadeOnDelete();
            $table->string('status');
            $table->string('location')->nullable();
            $table->text('remarks')->nullable();
            $table->string('tracking_number')->nullable();
            $table->timestamp('status_date')->useCurrent();
            $table->foreignId('updated_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_tracking');
    }
};