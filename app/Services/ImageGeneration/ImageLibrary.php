<?php

namespace App\Services\ImageGeneration;

use App\Models\Campaign;
use App\Models\CampaignImage;
use App\Models\Character;
use App\Models\CharacterExpression;
use App\Models\Location;
use App\Models\Npc;
use App\Models\NpcExpression;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Orchestrates image acquisition + the per-campaign catalog (CampaignImage).
 *
 * - acquire(): resolves an ImageInput to a public-disk path. For source
 *   'existing' it reuses an already-cataloged path (no copy); for 'upload'/'ai'
 *   it delegates to the ImageGenerator and registers the new path.
 * - release(): physically deletes a file (and its catalog row) only when no
 *   other record still references it — paths may be shared (portrait == neutral
 *   sprite, or two entities reusing the same gallery image).
 */
class ImageLibrary
{
    /** Entity categories and their storage subfolder (relative to the campaign). */
    public const CATEGORIES = ['npcs', 'players', 'locations'];

    /**
     * Every column that may reference an image path, used for reference
     * counting before a physical delete.
     *
     * @var array<class-string, string>
     */
    private const PATH_COLUMNS = [
        Npc::class => 'portrait_path',
        NpcExpression::class => 'sprite_path',
        Character::class => 'portrait_path',
        CharacterExpression::class => 'sprite_path',
        Location::class => 'background_path',
    ];

    public function __construct(private readonly ImageGenerator $generator) {}

    /**
     * Resolve an ImageInput (from ImageInput::fromRequest) to a public-disk
     * path, cataloging new files. Returns the path.
     *
     * @param  array<string, mixed>  $input
     */
    public function acquire(array $input, Campaign $campaign, string $category, ?string $label = null): string
    {
        $this->assertCategory($category);

        if (($input['source'] ?? null) === 'existing') {
            $path = (string) ($input['path'] ?? '');
            $this->assertOwned($campaign, $path);

            return $path;
        }

        // Prefer the uploaded file's original name as the label — it makes the
        // reuse gallery searchable by document/image name.
        if (($input['source'] ?? null) === 'upload' && isset($input['upload'])) {
            $label = $input['upload']->getClientOriginalName() ?: $label;
        }

        $path = $this->generator->acquire($input, "campaigns/{$campaign->id}/{$category}");
        $this->register($campaign, $category, $path, $label);

        return $path;
    }

    /** Upsert a catalog row for a path, recording the current user as uploader. */
    public function register(Campaign $campaign, string $category, string $path, ?string $label = null): CampaignImage
    {
        $this->assertCategory($category);

        return CampaignImage::firstOrCreate(
            ['campaign_id' => $campaign->id, 'path' => $path],
            ['category' => $category, 'label' => $label, 'user_id' => auth()->id()],
        );
    }

    /**
     * Delete the physical file and its catalog row, but only if no record
     * still references the path. Safe to call with null.
     */
    public function release(?string $path): void
    {
        if (! $path) {
            return;
        }

        if ($this->isReferenced($path)) {
            return;
        }

        Storage::disk('public')->delete($path);
        CampaignImage::where('path', $path)->delete();
    }

    /** Throw a validation error unless the path is cataloged for this campaign. */
    public function assertOwned(Campaign $campaign, string $path): void
    {
        $owned = $campaign->images()->where('path', $path)->exists();

        if (! $owned) {
            throw ValidationException::withMessages([
                'image' => 'A imagem selecionada não pertence a esta campanha.',
            ]);
        }
    }

    private function isReferenced(string $path): bool
    {
        foreach (self::PATH_COLUMNS as $model => $column) {
            if ($model::where($column, $path)->exists()) {
                return true;
            }
        }

        return false;
    }

    private function assertCategory(string $category): void
    {
        if (! in_array($category, self::CATEGORIES, true)) {
            throw new \InvalidArgumentException("Unknown image category: {$category}");
        }
    }
}
