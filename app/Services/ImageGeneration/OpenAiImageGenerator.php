<?php

namespace App\Services\ImageGeneration;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * OpenAI driver for image acquisition.
 *
 * - source=upload: stores the file (same behavior as UploadImageGenerator).
 * - source=ai with no references: POST /v1/images/generations.
 * - source=ai with references: POST /v1/images/edits (multipart, image[]=...).
 *
 * The model (default gpt-image-1) returns base64-encoded PNGs which we
 * persist to the "public" disk and return the relative path.
 *
 * Config (see config/services.php):
 *   services.openai.api_key
 *   services.openai.image_model   (default: gpt-image-1)
 *   services.openai.image_size    (default: 1024x1024)
 *   services.openai.base_uri      (default: https://api.openai.com/v1)
 */
class OpenAiImageGenerator implements ImageGenerator
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model = 'gpt-image-1',
        private readonly string $defaultSize = '1024x1024',
        private readonly string $quality = 'low',
        private readonly string $baseUri = 'https://api.openai.com/v1',
    ) {
    }

    public function acquire(array $input, string $folder): string
    {
        $source = $input['source'] ?? 'upload';

        if ($source === 'upload') {
            $file = $input['upload'] ?? null;
            if (! $file) {
                throw ValidationException::withMessages(['upload' => 'An image file is required.']);
            }
            return $file->store($folder, 'public');
        }

        $prompt = trim((string) ($input['prompt'] ?? ''));
        if ($prompt === '') {
            throw ValidationException::withMessages(['prompt' => 'A prompt is required to generate an image.']);
        }

        $size = $input['size'] ?? $this->defaultSize;
        $references = $input['references'] ?? [];
        $existingRefs = $input['existing_refs'] ?? [];

        $b64 = empty($references) && empty($existingRefs)
            ? $this->generate($prompt, $size)
            : $this->edit($prompt, $size, $references, $existingRefs);

        $binary = base64_decode($b64, true);
        if ($binary === false) {
            throw new RuntimeException('OpenAI returned a malformed image payload.');
        }

        $filename = $folder.'/'.Str::uuid()->toString().'.png';
        Storage::disk('public')->put($filename, $binary);

        return $filename;
    }

    private function client(): PendingRequest
    {
        return Http::withToken($this->apiKey)
            ->baseUrl($this->baseUri)
            ->timeout(120)
            ->acceptJson();
    }

    private function generate(string $prompt, string $size): string
    {
        $resp = $this->client()->post('/images/generations', [
            'model' => $this->model,
            'prompt' => $prompt,
            'size' => $size,
            'quality' => $this->quality,
            'n' => 1,
        ]);

        if ($resp->failed()) {
            $this->fail($resp->json('error.message') ?? $resp->body());
        }

        $b64 = $resp->json('data.0.b64_json');
        if (! is_string($b64)) {
            throw new RuntimeException('OpenAI response missing b64_json.');
        }
        return $b64;
    }

    /**
     * @param  array<int, \Illuminate\Http\UploadedFile>  $references
     * @param  array<int, string>  $existingRefs
     */
    private function edit(string $prompt, string $size, array $references, array $existingRefs): string
    {
        $req = Http::withToken($this->apiKey)
            ->baseUrl($this->baseUri)
            ->timeout(180)
            ->acceptJson()
            ->asMultipart();

        // New uploads
        foreach ($references as $i => $file) {
            $req = $req->attach(
                'image[]',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName() ?: "ref{$i}.png",
            );
        }

        // Existing refs (paths on public disk)
        foreach ($existingRefs as $i => $path) {
            if (! Storage::disk('public')->exists($path)) {
                continue;
            }
            $req = $req->attach(
                'image[]',
                Storage::disk('public')->get($path),
                basename($path) ?: "existing{$i}.png",
            );
        }

        $resp = $req->post('/images/edits', [
            ['name' => 'model', 'contents' => $this->model],
            ['name' => 'prompt', 'contents' => $prompt],
            ['name' => 'size', 'contents' => $size],
            ['name' => 'quality', 'contents' => $this->quality],
            ['name' => 'n', 'contents' => '1'],
        ]);

        if ($resp->failed()) {
            $this->fail($resp->json('error.message') ?? $resp->body());
        }

        $b64 = $resp->json('data.0.b64_json');
        if (! is_string($b64)) {
            throw new RuntimeException('OpenAI response missing b64_json.');
        }
        return $b64;
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages([
            'image' => 'OpenAI image generation failed: '.$message,
        ]);
    }
}
