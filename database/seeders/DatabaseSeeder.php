<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Character;
use App\Models\Location;
use App\Models\Npc;
use App\Models\NpcExpression;
use App\Models\Quest;
use App\Models\Scene;
use App\Models\SceneLine;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $dm = User::factory()->create([
            'name' => 'DM Henrique',
            'email' => 'dm@example.com',
            'password' => Hash::make('password'),
        ]);

        $player = User::factory()->create([
            'name' => 'Jogador Exemplo',
            'email' => 'player@example.com',
            'password' => Hash::make('password'),
        ]);

        /** @var Campaign $campaign */
        $campaign = Campaign::factory()->create([
            'dm_user_id' => $dm->id,
            'name' => 'A Sombra de Phandalin',
            'synopsis' => 'Um grupo de aventureiros chega à pacata Phandalin para descobrir que algo sinistro espreita nas montanhas.',
        ]);

        $campaign->players()->attach($player->id);

        $tavern = Location::factory()->create([
            'campaign_id' => $campaign->id,
            'name' => 'Taverna do Javali Bêbado',
            'description' => 'Pequena taverna iluminada por lampiões de óleo.',
        ]);

        Location::factory()->create([
            'campaign_id' => $campaign->id,
            'name' => 'Floresta Sussurrante',
            'description' => 'Árvores antigas que parecem observar quem passa.',
        ]);

        $innkeeper = Npc::factory()->create([
            'campaign_id' => $campaign->id,
            'name' => 'Toblen Stonehill',
            'role' => 'Taverneiro',
            'description' => 'Homem de meia-idade, gentil, sempre limpando canecas.',
        ]);

        NpcExpression::factory()->create([
            'npc_id' => $innkeeper->id,
            'label' => 'neutral',
            'is_default' => true,
        ]);
        NpcExpression::factory()->create([
            'npc_id' => $innkeeper->id,
            'label' => 'com_medo',
        ]);

        Character::factory()->create([
            'campaign_id' => $campaign->id,
            'user_id' => $player->id,
            'name' => 'Aria Sombra-Longa',
            'race' => 'Elf',
            'class' => 'Rogue',
            'level' => 3,
        ]);

        Quest::factory()->create([
            'campaign_id' => $campaign->id,
            'title' => 'Investigar os desaparecimentos',
            'description' => 'Vários moradores sumiram. O xerife pediu ajuda.',
            'status' => 'active',
        ]);

        $scene = Scene::factory()->published()->create([
            'campaign_id' => $campaign->id,
            'location_id' => $tavern->id,
            'title' => 'Chegada à taverna',
            'summary' => 'Os heróis entram no Javali Bêbado.',
        ]);

        SceneLine::factory()->create([
            'scene_id' => $scene->id,
            'position' => 1,
            'kind' => SceneLine::KIND_NARRATION,
            'body' => 'A porta de carvalho range. O calor da lareira contrasta com o frio lá fora.',
        ]);
        SceneLine::factory()->create([
            'scene_id' => $scene->id,
            'position' => 2,
            'kind' => SceneLine::KIND_NPC,
            'npc_id' => $innkeeper->id,
            'npc_expression_id' => $innkeeper->expressions()->where('label', 'neutral')->first()->id,
            'body' => 'Boa noite, viajantes! Sentem-se. Caldo quente e cerveja gelada por dois cobres.',
        ]);
        SceneLine::factory()->create([
            'scene_id' => $scene->id,
            'position' => 3,
            'kind' => SceneLine::KIND_NPC,
            'npc_id' => $innkeeper->id,
            'npc_expression_id' => $innkeeper->expressions()->where('label', 'com_medo')->first()->id,
            'body' => 'Mas... cuidado. Não é noite para se andar sozinho na floresta.',
        ]);
    }
}
