<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_musicians', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role'); // rol asignado en este evento específico
            $table->primary(['event_id', 'user_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_musicians');
    }
};
