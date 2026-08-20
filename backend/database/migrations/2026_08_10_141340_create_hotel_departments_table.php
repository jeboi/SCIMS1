<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_departments', function (Blueprint $table) {
            $table->id('department_id');

            $table->string('department_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_departments');
    }
};