<?php

namespace App\Console\Commands;

use App\Models\CampaignImage;
use App\Models\Character;
use App\Models\CharacterExpression;
use App\Models\Location;
use App\Models\Npc;
use App\Models\NpcExpression;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * One-off migration: move legacy image files into the per-entity folder scheme
 * (campaigns/{id}/{npcs|players|locations}) and backfill the campaign_images
 * catalog. Idempotent — safe to re-run. Always backs up first unless told not to.
 */
class ReorganizeImages extends Command
{
    protected $signature = 'images:reorganize {--skip-backup : Do not copy the existing files to storage/app/backups first}
        {--force : Do not ask for confirmation}';

    protected $description = 'Move campaign images into per-entity folders and backfill the campaign_images catalog';

    /** @var array<string, string> oldPath => newPath, so each file moves once. */
    private array $moved = [];

    public function handle(): int
    {
        if (! $this->option('skip-backup') && ! $this->backup()) {
            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm('Move files and update paths now?', true)) {
            $this->info('Aborted.');

            return self::SUCCESS;
        }

        $this->process(
            Npc::query()->whereNotNull('portrait_path')->get(),
            fn (Npc $m) => $m->campaign_id,
            'portrait_path',
            'npcs',
            fn (Npc $m) => 'Retrato',
        );

        $this->process(
            NpcExpression::query()->with('npc:id,campaign_id')->whereNotNull('sprite_path')->get(),
            fn (NpcExpression $m) => $m->npc?->campaign_id,
            'sprite_path',
            'npcs',
            fn (NpcExpression $m) => $m->label,
        );

        $this->process(
            Character::query()->whereNotNull('portrait_path')->get(),
            fn (Character $m) => $m->campaign_id,
            'portrait_path',
            'players',
            fn (Character $m) => 'Retrato',
        );

        $this->process(
            CharacterExpression::query()->with('character:id,campaign_id')->whereNotNull('sprite_path')->get(),
            fn (CharacterExpression $m) => $m->character?->campaign_id,
            'sprite_path',
            'players',
            fn (CharacterExpression $m) => $m->label,
        );

        $this->process(
            Location::query()->whereNotNull('background_path')->get(),
            fn (Location $m) => $m->campaign_id,
            'background_path',
            'locations',
            fn (Location $m) => 'Background',
        );

        $this->info('Done.');

        return self::SUCCESS;
    }

    /**
     * @param  Collection<int, Model>  $records
     * @param  callable(Model): ?int  $campaignId
     * @param  callable(Model): ?string  $label
     */
    private function process($records, callable $campaignId, string $column, string $category, callable $label): void
    {
        foreach ($records as $record) {
            $cid = $campaignId($record);
            $old = $record->{$column};
            if (! $cid || ! $old) {
                continue;
            }

            $new = $this->relocate($old, $cid, $category);

            if ($new !== $old) {
                $record->forceFill([$column => $new])->saveQuietly();
            }

            if (Storage::disk('public')->exists($new)) {
                CampaignImage::firstOrCreate(
                    ['campaign_id' => $cid, 'path' => $new],
                    ['category' => $category, 'label' => $label($record)],
                );
            }
        }
    }

    /** Move a file to the per-entity folder (once) and return its new path. */
    private function relocate(string $oldPath, int $campaignId, string $category): string
    {
        if (isset($this->moved[$oldPath])) {
            return $this->moved[$oldPath];
        }

        $disk = Storage::disk('public');
        $newPath = "campaigns/{$campaignId}/{$category}/".basename($oldPath);

        if ($oldPath === $newPath) {
            return $this->moved[$oldPath] = $newPath;
        }

        if ($disk->exists($oldPath)) {
            // Avoid clobbering a different file that already lives at the target.
            while ($disk->exists($newPath)) {
                $newPath = "campaigns/{$campaignId}/{$category}/".Str::random(8).'-'.basename($oldPath);
            }
            $disk->move($oldPath, $newPath);
            $this->line("  moved {$oldPath} -> {$newPath}");
        }

        return $this->moved[$oldPath] = $newPath;
    }

    private function backup(): bool
    {
        $source = Storage::disk('public')->path('campaigns');
        if (! File::isDirectory($source)) {
            $this->info('No campaigns/ directory to back up.');

            return true;
        }

        $dest = storage_path('app/backups/campaigns-'.now()->format('Ymd-His'));
        File::ensureDirectoryExists(dirname($dest));
        File::copyDirectory($source, $dest);
        $this->info("Backup created at: {$dest}");

        return true;
    }
}
