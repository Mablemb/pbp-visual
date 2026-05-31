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
        Schema::create('scene_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position');
            // narration | npc
            $table->string('kind')->default('npc');
            $table->foreignId('npc_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('npc_expression_id')->nullable()->constrained('npc_expressions')->nullOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->unique(['scene_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_lines');
    }
};
