<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->onDelete('cascade');
            $table->string('title');
            $table->string('artist');
            $table->text('notes')->nullable();
            $table->string('url')->nullable();
            $table->foreignId('suggested_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pendiente', 'ensayo', 'agregada'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suggestions');
    }
};
