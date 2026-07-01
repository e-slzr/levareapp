<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('group_id')->constrained('groups')->onDelete('cascade');
            $table->string('role'); // ej: 'Líder', 'Guitarra', etc.
            $table->primary(['user_id', 'group_id']);
            $table->timestamp('created_at')->useCurrent(); // joined_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_user');
    }
};
