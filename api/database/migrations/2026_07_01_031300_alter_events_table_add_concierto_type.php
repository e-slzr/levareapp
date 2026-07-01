<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modificar columna type para soportar concierto, manteniendo culto y los demás tipos
        DB::statement("ALTER TABLE events MODIFY COLUMN type ENUM('ensayo', 'culto', 'concierto', 'especial', 'otro') NOT NULL DEFAULT 'otro'");
    }

    public function down(): void
    {
        // Revertir al estado original
        DB::statement("ALTER TABLE events MODIFY COLUMN type ENUM('ensayo', 'culto', 'especial', 'otro') NOT NULL DEFAULT 'otro'");
    }
};
