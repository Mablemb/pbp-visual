<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Location;
use App\Services\ImageGeneration\ImageGenerator;
use App\Services\ImageGeneration\ImageInput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function create(Campaign $campaign): Response
    {
        $this->authorize('manage', $campaign);

        return Inertia::render('Locations/Create', ['campaign' => $campaign->only('id', 'name')]);
    }

    public function store(Request $request, Campaign $campaign, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'background')) {
            $data['background_path'] = $images->acquire(
                $input,
                "campaigns/{$campaign->id}/backgrounds",
            );
        }

        $campaign->locations()->create($data);

        return redirect()->route('campaigns.show', $campaign);
    }

    public function edit(Location $location): Response
    {
        $this->authorize('manage', $location->campaign);

        return Inertia::render('Locations/Edit', [
            'location' => $location,
            'campaign' => $location->campaign->only('id', 'name'),
        ]);
    }

    public function update(Request $request, Location $location, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('manage', $location->campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'background')) {
            if ($location->background_path) {
                Storage::disk('public')->delete($location->background_path);
            }
            $data['background_path'] = $images->acquire(
                $input,
                "campaigns/{$location->campaign_id}/backgrounds",
            );
        }

        $location->update($data);

        return redirect()->route('campaigns.show', $location->campaign_id);
    }

    public function destroy(Location $location): RedirectResponse
    {
        $this->authorize('manage', $location->campaign);

        if ($location->background_path) {
            Storage::disk('public')->delete($location->background_path);
        }
        $campaignId = $location->campaign_id;
        $location->delete();

        return redirect()->route('campaigns.show', $campaignId);
    }

    private function validated(Request $request): array
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            ...ImageInput::rules('background'),
        ]);

        // Only return the model-bound fields; image input is consumed
        // separately via ImageInput::fromRequest().
        return $request->only(['name', 'description']);
    }
}
