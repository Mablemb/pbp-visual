<?php

namespace App\Services\ImageGeneration;

use Illuminate\Http\Request;

/**
 * Helpers to validate and extract a polymorphic image-source field from a
 * request. Use one instance per logical image (e.g. "background", "sprite",
 * "portrait") — the $field controls the form input names.
 *
 * Front-end is expected to submit:
 *   <field>_source     "upload" | "ai" | "existing"
 *   <field>            UploadedFile      (when source=upload)
 *   <field>_prompt     string            (when source=ai)
 *   <field>_refs[]     UploadedFile[]    (when source=ai, optional)
 *   <field>_existing_refs[] string[]     (when source=ai, optional — public-disk paths)
 *   <field>_existing_path  string        (when source=existing — public-disk path to reuse)
 */
class ImageInput
{
    public const MAX_REFS = 6;

    /** Validation rules for one image field. */
    public static function rules(string $field, bool $required = false): array
    {
        $req = $required ? ['required'] : ['nullable'];

        return [
            "{$field}_source" => array_merge($req, ['in:upload,ai,existing']),
            // Upload mode
            $field => ['nullable', 'image', 'max:5120', "required_if:{$field}_source,upload"],
            // AI mode
            "{$field}_prompt" => ['nullable', 'string', 'max:2000', "required_if:{$field}_source,ai"],
            "{$field}_refs" => ['nullable', 'array', 'max:'.self::MAX_REFS],
            "{$field}_refs.*" => ['image', 'max:5120'],
            "{$field}_existing_refs" => ['nullable', 'array', 'max:'.self::MAX_REFS],
            "{$field}_existing_refs.*" => ['string'],
            // Existing mode (reuse a cataloged path, no re-upload)
            "{$field}_existing_path" => ['nullable', 'string', "required_if:{$field}_source,existing"],
        ];
    }

    /**
     * Build the array to pass to ImageGenerator::acquire(), or null if the
     * user didn't pick any source (i.e. they don't want to change the image).
     *
     * @return array<string, mixed>|null
     */
    public static function fromRequest(Request $request, string $field): ?array
    {
        $source = $request->input("{$field}_source");
        if (! in_array($source, ['upload', 'ai', 'existing'], true)) {
            return null;
        }

        if ($source === 'upload') {
            if (! $request->hasFile($field)) {
                return null;
            }

            return [
                'source' => 'upload',
                'upload' => $request->file($field),
            ];
        }

        if ($source === 'existing') {
            $path = (string) $request->input("{$field}_existing_path", '');
            if ($path === '') {
                return null;
            }

            return [
                'source' => 'existing',
                'path' => $path,
            ];
        }

        return [
            'source' => 'ai',
            'prompt' => (string) $request->input("{$field}_prompt"),
            'references' => $request->file("{$field}_refs") ?? [],
            'existing_refs' => array_values(array_filter(
                (array) $request->input("{$field}_existing_refs", []),
                fn ($v) => is_string($v) && $v !== '',
            )),
        ];
    }
}
