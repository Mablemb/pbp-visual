<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('damage_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_line_id')->constrained()->cascadeOnDelete();
            $table->foreignId('character_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('amount');
            $table->string('damage_type', 32);
            $table->timestamps();

            $table->index('scene_line_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_events');
    }
};
