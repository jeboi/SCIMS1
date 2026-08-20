<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurant_stock_requests', function (Blueprint $table) {
            // Rename primary key
            $table->renameColumn('stock_request_id', 'request_id');
            
            // Add new columns if they don't exist
            if (!Schema::hasColumn('restaurant_stock_requests', 'request_number')) {
                $table->string('request_number')->unique()->after('request_id');
            }
            
            if (!Schema::hasColumn('restaurant_stock_requests', 'remarks')) {
                $table->text('remarks')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('restaurant_stock_requests', 'required_date')) {
                $table->date('required_date')->nullable()->after('remarks');
            }
            
            if (!Schema::hasColumn('restaurant_stock_requests', 'urgency')) {
                $table->string('urgency')->default('normal')->after('required_date');
            }
            
            if (!Schema::hasColumn('restaurant_stock_requests', 'fulfilled_by')) {
                $table->foreignId('fulfilled_by')->nullable()->after('urgency');
            }
            
            if (!Schema::hasColumn('restaurant_stock_requests', 'fulfilled_at')) {
                $table->timestamp('fulfilled_at')->nullable()->after('fulfilled_by');
            }
            
            if (!Schema::hasColumn('restaurant_stock_requests', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    public function down(): void
    {
        Schema::table('restaurant_stock_requests', function (Blueprint $table) {
            // Reverse the changes if needed
        });
    }
};