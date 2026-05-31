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
        Schema::create('player_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('character_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            // pending | resolved
            $table->string('status')->default('pending');
            $table->text('dm_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_actions');
    }
};
