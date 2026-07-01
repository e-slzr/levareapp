<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('setlist_song', function (Blueprint $table) {
            $table->foreignId('setlist_id')->constrained('setlists')->onDelete('cascade');
            $table->foreignId('song_id')->constrained('songs')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->primary(['setlist_id', 'song_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('setlist_song');
    }
};
