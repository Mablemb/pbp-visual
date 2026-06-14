<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaign_images', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('campaign_id')
                ->constrained()->nullOnDelete();
        });

        // Backfill ownership for images cataloged before this column existed:
        // character art belongs to the player who owns the character; everything
        // else (NPCs, locations) belongs to the campaign's DM.
        $playerOwned = DB::table('characters')
            ->whereNotNull('portrait_path')
            ->pluck('user_id', 'portrait_path')
            ->merge(
                DB::table('character_expressions')
                    ->join('characters', 'characters.id', '=', 'character_expressions.character_id')
                    ->whereNotNull('sprite_path')
                    ->pluck('characters.user_id', 'character_expressions.sprite_path')
            );

        foreach ($playerOwned as $path => $userId) {
            DB::table('campaign_images')->where('path', $path)->update(['user_id' => $userId]);
        }

        foreach (DB::table('campaigns')->pluck('dm_user_id', 'id') as $campaignId => $dmUserId) {
            DB::table('campaign_images')
                ->where('campaign_id', $campaignId)
                ->whereNull('user_id')
                ->update(['user_id' => $dmUserId]);
        }
    }

    public function down(): void
    {
        Schema::table('campaign_images', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
