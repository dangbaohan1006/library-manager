<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->date('reservation_date');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('book_id');
            $table->index('member_id');
            $table->index('status');
        });

        // Set default for reservation_date after table creation
        DB::statement('ALTER TABLE reservations MODIFY COLUMN reservation_date DATE DEFAULT (CURRENT_DATE)');
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};

