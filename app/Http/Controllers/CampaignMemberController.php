<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CampaignMemberController extends Controller
{
    /** DM invites a player by email. */
    public function store(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if ($user->id === $campaign->dm_user_id) {
            throw ValidationException::withMessages([
                'email' => 'O DM já participa da campanha.',
            ]);
        }

        $campaign->players()->syncWithoutDetaching([$user->id]);

        return back();
    }

    public function destroy(Campaign $campaign, User $user): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $campaign->players()->detach($user->id);

        return back();
    }
}
