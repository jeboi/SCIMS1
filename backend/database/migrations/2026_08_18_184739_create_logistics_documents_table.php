<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->string('title');
            $table->string('document_number')->unique();
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('status')->default('draft');
            $table->date('document_date')->nullable();
            $table->string('reference_id')->nullable();
            $table->string('supplier')->nullable();
            $table->integer('items')->default(0);
            $table->string('file_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_documents');
    }
};