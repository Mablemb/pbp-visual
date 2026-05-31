<?php

namespace App\Services\ImageGeneration;

use Illuminate\Validation\ValidationException;

/**
 * Default driver: just stores an uploaded file on the public disk. Cannot
 * generate from a prompt, so AI-source requests fail with a friendly
 * validation message.
 */
class UploadImageGenerator implements ImageGenerator
{
    public function acquire(array $input, string $folder): string
    {
        $source = $input['source'] ?? 'upload';

        if ($source === 'ai') {
            throw ValidationException::withMessages([
                'image' => 'AI generation is not configured. Set IMAGE_DRIVER=openai in your .env to enable it.',
            ]);
        }

        $file = $input['upload'] ?? null;
        if (! $file) {
            throw ValidationException::withMessages([
                'upload' => 'An image file is required.',
            ]);
        }

        return $file->store($folder, 'public');
    }
}
