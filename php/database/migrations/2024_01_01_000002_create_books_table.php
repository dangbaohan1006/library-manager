<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title')->index();
            $table->string('author')->index();
            $table->string('edition')->nullable();
            $table->integer('publication_year')->nullable();
            $table->string('isbn')->unique();
            $table->integer('total_copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->string('image_path')->nullable();
            $table->timestamps();
        });

        // Check constraints for MySQL (must be after table creation)
        DB::statement('ALTER TABLE books ADD CONSTRAINT check_available_copies_positive CHECK (available_copies >= 0)');
        DB::statement('ALTER TABLE books ADD CONSTRAINT check_total_copies_positive CHECK (total_copies >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};

