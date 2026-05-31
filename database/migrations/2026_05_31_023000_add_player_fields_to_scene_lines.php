<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scene_lines', function (Blueprint $table) {
            $table->foreignId('character_id')->nullable()->after('npc_expression_id')
                ->constrained('characters')->nullOnDelete();
            $table->foreignId('player_action_id')->nullable()->after('character_id')
                ->constrained('player_actions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scene_lines', function (Blueprint $table) {
            $table->dropConstrainedForeignId('player_action_id');
            $table->dropConstrainedForeignId('character_id');
        });
    }
};
