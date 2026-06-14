<?php

namespace App\Services\ImageGeneration;

use Illuminate\Http\UploadedFile;

/**
 * Pluggable image acquisition.
 *
 * Supports two sources, picked per-call via $input['source']:
 *   - 'upload': stores the file given in $input['upload']
 *   - 'ai':     generates an image from $input['prompt'] plus optional
 *               reference images ($input['references'] uploads and/or
 *               $input['existing_refs'] paths on the "public" disk).
 *
 * Returns the resulting path on the "public" disk in both cases.
 *
 * Drivers that don't support AI may fall back to upload or throw.
 */
interface ImageGenerator
{
    /**
     * @param  array{
     *   source?: 'upload'|'ai',
     *   upload?: UploadedFile|null,
     *   prompt?: string|null,
     *   references?: array<int, UploadedFile>|null,
     *   existing_refs?: array<int, string>|null,
     *   size?: string|null
     * }  $input
     * @param  string  $folder  e.g. "campaigns/12/npcs", "campaigns/12/locations"
     */
    public function acquire(array $input, string $folder): string;
}
