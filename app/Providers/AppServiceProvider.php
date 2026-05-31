<?php

namespace App\Providers;

use App\Services\ImageGeneration\ImageGenerator;
use App\Services\ImageGeneration\OpenAiImageGenerator;
use App\Services\ImageGeneration\UploadImageGenerator;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ImageGenerator::class, function ($app) {
            $driver = config('services.image_generation.driver', 'upload');

            return match ($driver) {
                'openai' => new OpenAiImageGenerator(
                    apiKey: (string) config('services.openai.api_key'),
                    model: (string) config('services.openai.image_model', 'gpt-image-1'),
                    defaultSize: (string) config('services.openai.image_size', '1024x1024'),
                    quality: (string) config('services.openai.image_quality', 'low'),
                    baseUri: (string) config('services.openai.base_uri', 'https://api.openai.com/v1'),
                ),
                default => new UploadImageGenerator(),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
