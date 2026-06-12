<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Character;
use App\Services\ImageGeneration\ImageGenerator;
use App\Services\ImageGeneration\ImageInput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CharacterController extends Controller
{
    public function create(Campaign $campaign): Response
    {
        $this->authorize('view', $campaign);

        return Inertia::render('Characters/Create', [
            'campaign' => $campaign->only('id', 'name'),
        ]);
    }

    public function store(Request $request, Campaign $campaign, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('view', $campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'portrait')) {
            $data['portrait_path'] = $images->acquire(
                $input,
                "campaigns/{$campaign->id}/portraits",
            );
        }

        $data['user_id'] = $request->user()->id;
        $character = $campaign->characters()->create($data);

        return redirect()->route('characters.edit', $character);
    }

    public function edit(Request $request, Character $character): Response
    {
        // Owner of the PC (player) or the DM may edit.
        $this->authorize('view', $character->campaign);
        abort_unless(
            $character->user_id === $request->user()->id
            || $character->campaign->dm_user_id === $request->user()->id,
            403
        );

        return Inertia::render('Characters/Edit', [
            'character' => $character->load('expressions:id,character_id,label,sprite_path,is_default'),
            'campaign' => $character->campaign->only('id', 'name'),
            'expressionLabels' => ['neutral', 'happy', 'sad', 'angry', 'shocked', 'thoughtful'],
        ]);
    }

    public function update(Request $request, Character $character, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('view', $character->campaign);
        abort_unless(
            $character->user_id === $request->user()->id
            || $character->campaign->dm_user_id === $request->user()->id,
            403
        );

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'portrait')) {
            if ($character->portrait_path) {
                Storage::disk('public')->delete($character->portrait_path);
            }
            $data['portrait_path'] = $images->acquire(
                $input,
                "campaigns/{$character->campaign_id}/portraits",
            );
        }

        $character->update($data);

        return redirect()->route('characters.edit', $character);
    }

    public function destroyPortrait(Request $request, Character $character): RedirectResponse
    {
        $this->authorize('view', $character->campaign);
        abort_unless(
            $character->user_id === $request->user()->id
            || $character->campaign->dm_user_id === $request->user()->id,
            403
        );

        if ($character->portrait_path) {
            Storage::disk('public')->delete($character->portrait_path);
            $character->update(['portrait_path' => null]);
        }

        return back();
    }

    public function destroy(Request $request, Character $character): RedirectResponse
    {
        abort_unless(
            $character->user_id === $request->user()->id
            || $character->campaign->dm_user_id === $request->user()->id,
            403
        );

        if ($character->portrait_path) {
            Storage::disk('public')->delete($character->portrait_path);
        }
        $campaignId = $character->campaign_id;
        $character->delete();

        return redirect()->route('campaigns.show', $campaignId);
    }

    private function validated(Request $request): array
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'race' => ['nullable', 'string', 'max:60'],
            'class' => ['nullable', 'string', 'max:60'],
            'level' => ['required', 'integer', 'min:1', 'max:20'],
            'hp_max' => ['required', 'integer', 'min:1', 'max:999'],
            'hp_current' => ['required', 'integer', 'min:0', 'max:999'],
            'strength' => ['required', 'integer', 'min:1', 'max:30'],
            'dexterity' => ['required', 'integer', 'min:1', 'max:30'],
            'constitution' => ['required', 'integer', 'min:1', 'max:30'],
            'intelligence' => ['required', 'integer', 'min:1', 'max:30'],
            'wisdom' => ['required', 'integer', 'min:1', 'max:30'],
            'charisma' => ['required', 'integer', 'min:1', 'max:30'],
            'bio' => ['nullable', 'string', 'max:5000'],
            ...ImageInput::rules('portrait'),
        ]);

        return $request->only([
            'name', 'race', 'class', 'level', 'hp_max', 'hp_current',
            'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
            'bio',
        ]);
    }
}
