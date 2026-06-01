<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('npcs', function (Blueprint $table) {
            $table->string('race')->nullable()->after('name');
            $table->string('class')->nullable()->after('race');
            $table->unsignedTinyInteger('level')->default(1)->after('class');
            $table->unsignedSmallInteger('hp_max')->default(10)->after('level');
            $table->unsignedSmallInteger('hp_current')->default(10)->after('hp_max');
            $table->unsignedTinyInteger('strength')->default(10)->after('hp_current');
            $table->unsignedTinyInteger('dexterity')->default(10)->after('strength');
            $table->unsignedTinyInteger('constitution')->default(10)->after('dexterity');
            $table->unsignedTinyInteger('intelligence')->default(10)->after('constitution');
            $table->unsignedTinyInteger('wisdom')->default(10)->after('intelligence');
            $table->unsignedTinyInteger('charisma')->default(10)->after('wisdom');
            $table->text('bio')->nullable()->after('description');
            $table->string('portrait_path')->nullable()->after('bio');
        });

        Schema::table('damage_events', function (Blueprint $table) {
            $table->foreignId('npc_id')
                ->nullable()
                ->after('character_id')
                ->constrained('npcs')
                ->cascadeOnDelete();
            $table->index('npc_id');
        });

        // Make character_id nullable (one of character_id / npc_id required).
        // SQLite-safe: use raw DB call via Schema change.
        Schema::table('damage_events', function (Blueprint $table) {
            $table->foreignId('character_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('damage_events', function (Blueprint $table) {
            $table->dropForeign(['npc_id']);
            $table->dropColumn('npc_id');
            $table->foreignId('character_id')->nullable(false)->change();
        });

        Schema::table('npcs', function (Blueprint $table) {
            $table->dropColumn([
                'race', 'class', 'level',
                'hp_max', 'hp_current',
                'strength', 'dexterity', 'constitution',
                'intelligence', 'wisdom', 'charisma',
                'bio', 'portrait_path',
            ]);
        });
    }
};
