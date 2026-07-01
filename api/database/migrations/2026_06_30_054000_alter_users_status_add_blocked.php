<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'blocked' to the status enum column in the users table
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'rejected', 'blocked') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to the original enum values
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'active'");
    }
};
