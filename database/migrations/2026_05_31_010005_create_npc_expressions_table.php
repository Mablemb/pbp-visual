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
        Schema::create('npc_expressions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('npc_id')->constrained()->cascadeOnDelete();
            // Slug like "neutral", "happy", "angry", "sad".
            $table->string('label');
            $table->string('sprite_path');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->unique(['npc_id', 'label']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('npc_expressions');
    }
};
