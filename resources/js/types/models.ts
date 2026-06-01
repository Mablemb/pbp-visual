// Domain models exposed to React via Inertia props.
// Keep these in sync with the Eloquent models / controllers.

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface CampaignSummary {
    id: number;
    name: string;
    synopsis: string | null;
}

export interface NpcExpression {
    id: number;
    npc_id: number;
    label: string;
    sprite_path: string;
    is_default: boolean;
}

export interface Npc {
    id: number;
    campaign_id: number;
    name: string;
    role: string | null;
    description: string | null;
    race?: string | null;
    class?: string | null;
    level?: number;
    hp_max?: number;
    hp_current?: number;
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
    bio?: string | null;
    portrait_path?: string | null;
    expressions?: NpcExpression[];
}

export interface Location {
    id: number;
    campaign_id: number;
    name: string;
    description: string | null;
    background_path: string | null;
}

export interface Character {
    id: number;
    campaign_id: number;
    user_id: number;
    name: string;
    race: string | null;
    class: string | null;
    level: number;
    hp_max: number;
    hp_current: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    bio: string | null;
    portrait_path: string | null;
    user?: Pick<User, 'id' | 'name'>;
    expressions?: CharacterExpression[];
}

export interface CharacterExpression {
    id: number;
    character_id: number;
    label: string;
    sprite_path: string;
    is_default: boolean;
}

export interface Quest {
    id: number;
    campaign_id: number;
    title: string;
    description: string | null;
    status: 'active' | 'completed' | 'failed';
}

export interface Scene {
    id: number;
    campaign_id: number;
    location_id: number | null;
    title: string;
    summary: string | null;
    status: 'draft' | 'published';
    published_at: string | null;
    campaign?: Pick<Campaign, 'id' | 'name' | 'dm_user_id'>;
    location?: Location | null;
    lines?: SceneLine[];
}

export interface SceneLine {
    id: number;
    scene_id: number;
    position: number;
    kind: 'narration' | 'npc' | 'player';
    npc_id: number | null;
    npc_expression_id: number | null;
    character_id: number | null;
    character_expression_id: number | null;
    player_kind: 'action' | 'dialogue' | null;
    player_action_id: number | null;
    body: string;
    npc?: Pick<Npc, 'id' | 'name'> | null;
    expression?: Pick<NpcExpression, 'id' | 'sprite_path' | 'label' | 'npc_id'> | null;
    character?: Pick<Character, 'id' | 'name' | 'portrait_path'> | null;
    character_expression?: Pick<CharacterExpression, 'id' | 'sprite_path' | 'label' | 'character_id'> | null;
    damage_events?: DamageEvent[];
}

export interface DamageEvent {
    id: number;
    scene_line_id: number;
    character_id: number | null;
    npc_id: number | null;
    amount: number;
    damage_type: string;
    character?: Pick<Character, 'id' | 'name' | 'portrait_path' | 'hp_current' | 'hp_max'> | null;
    npc?: Pick<Npc, 'id' | 'name' | 'portrait_path' | 'hp_current' | 'hp_max'> | null;
}

export interface PlayerAction {
    id: number;
    scene_id: number;
    user_id: number;
    character_id: number | null;
    character_expression_id: number | null;
    kind: 'action' | 'dialogue';
    body: string;
    status: 'pending' | 'resolved';
    dm_notes: string | null;
    created_at: string;
    user?: Pick<User, 'id' | 'name'>;
    character?: Pick<Character, 'id' | 'name' | 'portrait_path'> | null;
    character_expression?: Pick<CharacterExpression, 'id' | 'sprite_path' | 'label' | 'character_id'> | null;
    scene?: Pick<Scene, 'id' | 'title' | 'campaign_id'>;
}

export interface Campaign {
    id: number;
    name: string;
    synopsis: string | null;
    dm_user_id: number;
    dm?: Pick<User, 'id' | 'name' | 'email'>;
    players?: Pick<User, 'id' | 'name' | 'email'>[];
    locations?: Location[];
    npcs?: Npc[];
    characters?: Character[];
    quests?: Quest[];
    scenes?: Scene[];
}

/** Helper: convert "storage path" coming from Laravel into a public URL. */
export function asset(path: string | null | undefined): string | undefined {
    if (!path) return undefined;
    return `/storage/${path}`;
}
