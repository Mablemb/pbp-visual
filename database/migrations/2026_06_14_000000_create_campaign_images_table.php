<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            // npcs | players | locations
            $table->string('category', 32);
            $table->string('path');
            $table->string('label')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'category']);
            $table->unique(['campaign_id', 'path']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_images');
    }
};
