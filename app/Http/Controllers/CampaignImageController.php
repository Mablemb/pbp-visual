<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Services\ImageGeneration\ImageLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CampaignImageController extends Controller
{
    /**
     * Reuse gallery: lists the campaign's cataloged images so the front-end can
     * point at an existing path instead of re-uploading. The DM sees every image
     * in the campaign; a player only sees images they uploaded themselves.
     * Results carry their category (folder) and filename for client-side
     * folder/search navigation.
     */
    public function index(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorize('view', $campaign);

        $request->validate([
            'category' => ['sometimes', 'nullable', 'string', Rule::in(ImageLibrary::CATEGORIES)],
        ]);

        $query = $campaign->images()->latest();

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Players are limited to their own uploads; the DM sees everything.
        if ($campaign->dm_user_id !== $request->user()->id) {
            $query->where('user_id', $request->user()->id);
        }

        $images = $query->get(['id', 'category', 'path', 'label'])
            ->map(fn ($image) => [
                'id' => $image->id,
                'category' => $image->category,
                'path' => $image->path,
                'label' => $image->label,
                'filename' => basename($image->path),
                'url' => Storage::disk('public')->url($image->path),
            ]);

        return response()->json($images);
    }
}
