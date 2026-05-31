<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;

/**
 * Authorization rules for campaign-scoped resources.
 *
 *  - Anyone signed-in can create a campaign (they become its DM).
 *  - Only the DM can edit/delete the campaign and manage its content
 *    (NPCs, locations, scenes, quests, invitations).
 *  - DM + invited players can view the campaign and its content.
 */
class CampaignPolicy
{
    public function view(User $user, Campaign $campaign): bool
    {
        return $campaign->isAccessibleBy($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Campaign $campaign): bool
    {
        return $campaign->dm_user_id === $user->id;
    }

    public function delete(User $user, Campaign $campaign): bool
    {
        return $campaign->dm_user_id === $user->id;
    }

    /** Can edit DM-only content (NPCs, locations, scenes, quests, invites). */
    public function manage(User $user, Campaign $campaign): bool
    {
        return $campaign->dm_user_id === $user->id;
    }
}
