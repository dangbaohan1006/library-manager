<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('restrict');
            $table->date('loan_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            // Composite index for overdue queries
            $table->index(['status', 'return_date', 'due_date'], 'idx_loan_overdue');
        });

        // Set default for loan_date and add check constraint after table creation
        DB::statement('ALTER TABLE loans MODIFY COLUMN loan_date DATE DEFAULT (CURRENT_DATE)');
        DB::statement('ALTER TABLE loans ADD CONSTRAINT check_due_date_valid CHECK (due_date >= loan_date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};

