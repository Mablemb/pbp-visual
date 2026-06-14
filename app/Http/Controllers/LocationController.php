<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Location;
use App\Services\ImageGeneration\ImageInput;
use App\Services\ImageGeneration\ImageLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function create(Campaign $campaign): Response
    {
        $this->authorize('manage', $campaign);

        return Inertia::render('Locations/Create', ['campaign' => $campaign->only('id', 'name')]);
    }

    public function store(Request $request, Campaign $campaign, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'background')) {
            $data['background_path'] = $library->acquire($input, $campaign, 'locations', 'Background');
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

    public function update(Request $request, Location $location, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $location->campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'background')) {
            $oldPath = $location->background_path;
            $data['background_path'] = $library->acquire($input, $location->campaign, 'locations', 'Background');
            if ($oldPath && $oldPath !== $data['background_path']) {
                $library->release($oldPath);
            }
        }

        $location->update($data);

        return redirect()->route('campaigns.show', $location->campaign_id);
    }

    public function destroyBackground(Location $location, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $location->campaign);

        if ($location->background_path) {
            $path = $location->background_path;
            $location->update(['background_path' => null]);
            $library->release($path);
        }

        return back();
    }

    public function destroy(Location $location, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $location->campaign);

        $campaignId = $location->campaign_id;
        $path = $location->background_path;
        $location->delete();
        $library->release($path);

        return redirect()->route('campaigns.show', $campaignId);
    }

    private function validated(Request $request): array
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:5000'],
            ...ImageInput::rules('background'),
        ]);

        // Only return the model-bound fields; image input is consumed
        // separately via ImageInput::fromRequest().
        return $request->only(['name', 'description']);
    }
}
