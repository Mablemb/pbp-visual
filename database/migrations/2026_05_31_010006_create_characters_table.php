<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            // Player who owns the PC. DM-owned NPCs use the Npc model instead.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('race')->nullable();
            $table->string('class')->nullable();
            $table->unsignedTinyInteger('level')->default(1);
            $table->unsignedSmallInteger('hp_max')->default(10);
            $table->unsignedSmallInteger('hp_current')->default(10);
            // D&D 5e ability scores.
            $table->unsignedTinyInteger('strength')->default(10);
            $table->unsignedTinyInteger('dexterity')->default(10);
            $table->unsignedTinyInteger('constitution')->default(10);
            $table->unsignedTinyInteger('intelligence')->default(10);
            $table->unsignedTinyInteger('wisdom')->default(10);
            $table->unsignedTinyInteger('charisma')->default(10);
            $table->text('bio')->nullable();
            $table->string('portrait_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};
