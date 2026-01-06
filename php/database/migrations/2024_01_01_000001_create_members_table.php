<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('full_name');
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('joined_date');
            $table->timestamps();

            $table->index('email');
            $table->index('is_active');
        });

        // Set default for joined_date after table creation (MySQL doesn't support CURRENT_DATE in default)
        DB::statement('ALTER TABLE members MODIFY COLUMN joined_date DATE DEFAULT (CURRENT_DATE)');
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};

