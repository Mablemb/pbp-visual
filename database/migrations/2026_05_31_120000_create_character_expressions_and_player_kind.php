<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('character_expressions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('character_id')->constrained()->cascadeOnDelete();
            $table->string('label', 40);
            $table->string('sprite_path');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->unique(['character_id', 'label']);
        });

        Schema::table('player_actions', function (Blueprint $table) {
            // action | dialogue
            $table->string('kind', 16)->default('action')->after('character_id');
            $table->foreignId('character_expression_id')->nullable()->after('kind')
                ->constrained('character_expressions')->nullOnDelete();
        });

        Schema::table('scene_lines', function (Blueprint $table) {
            // when kind=player, distinguishes action vs dialogue (null otherwise)
            $table->string('player_kind', 16)->nullable()->after('character_id');
            $table->foreignId('character_expression_id')->nullable()->after('player_kind')
                ->constrained('character_expressions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scene_lines', function (Blueprint $table) {
            $table->dropConstrainedForeignId('character_expression_id');
            $table->dropColumn('player_kind');
        });
        Schema::table('player_actions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('character_expression_id');
            $table->dropColumn('kind');
        });
        Schema::dropIfExists('character_expressions');
    }
};
