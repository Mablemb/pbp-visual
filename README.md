# pbp-visual

Aplicação Laravel para enriquecer sessões de D&D 5e Play-by-Post (Discord) com
uma interface inspirada em visual novels: cenas com background, NPCs e
expressões, fichas, locais, missões, e ações livres dos jogadores.

## Stack

- **Backend**: Laravel 13, MySQL 8, Redis (via Laravel Sail / Docker)
- **Frontend**: Inertia.js + React 18 + TypeScript + Tailwind v3 (scaffold Breeze)
- **Auth**: Laravel Breeze (sessão + cookies)

## Rodando localmente

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail npm run dev
```

App em http://localhost:8000

### Usuários seed

| Papel  | E-mail               | Senha    |
| ------ | -------------------- | -------- |
| DM     | dm@example.com       | password |
| Player | player@example.com   | password |

## Estrutura

```
app/
├── Http/Controllers/           # Campaign, Npc, Location, Character, Quest, ...
├── Models/                     # 10 models do domínio
├── Policies/CampaignPolicy.php # DM vs Player
└── Services/ImageGeneration/   # Contrato + driver de upload
                                # (futuro: driver de IA)
database/
├── migrations/                 # 10 tabelas do domínio
├── factories/
└── seeders/DatabaseSeeder.php  # 1 DM, 1 player, 1 campanha exemplo
resources/js/
├── Pages/
│   ├── Campaigns/{Index,Create,Edit,Show}.tsx
│   ├── Locations/{Create,Edit}.tsx
│   ├── Npcs/{Create,Edit}.tsx
│   ├── Characters/{Create,Edit}.tsx
│   └── Quests/{Create,Edit}.tsx
└── types/models.ts
routes/web.php
```

## Domínio

```
Campaign ─┬── dm (User)
          ├── players (Users via campaign_members)
          ├── locations (background)
          ├── npcs ── expressions (sprite por emoção)
          ├── characters (PCs D&D 5e)
          ├── quests (active/completed/failed)
          └── scenes (draft/published) ── lines (ordenadas)
                                        └── player_actions
```

## O que está pronto (MVP atual)

- [x] Auth Breeze + Inertia + React + TS
- [x] CRUD de **Campanhas** + convidar/remover jogadores
- [x] CRUD de **Cenários** com upload de background
- [x] CRUD de **NPCs** + gerenciar múltiplas **expressões** (sprites)
- [x] CRUD de **Personagens** (PCs) com atributos D&D 5e + retrato
- [x] CRUD de **Missões** com status
- [x] Hub central por campanha (`Campaigns/Show`) com todas as seções
- [x] Hook `ImageGenerator` (driver upload) — pronto para plugar IA

## Próximos passos sugeridos

1. **Editor de Cenas** (DM): escolher background, adicionar linhas
   (narração / NPC + expressão), reordenar, publicar.
2. **Visualizador de Cenas** estilo visual novel para o jogador.
3. **Ações do jogador** (texto livre) submetidas em cima de uma cena,
   com inbox para o DM resolver.
4. Driver `ImageGenerator` para IA (OpenAI / Replicate).
5. (Futuro) rolagem de dados, combate por turnos.

## Notas arquiteturais (para estudo)

- Autorização centralizada em `CampaignPolicy` (`view` = DM+players,
  `manage` = só DM). Controllers de child-resources chamam
  `$this->authorize('manage', $resource->campaign)`.
- Uploads passam por `ImageGenerator` (interface). Trocar para IA depois
  é só implementar e rebind no `AppServiceProvider`.
- Rotas usam **shallow nesting** + `scopeBindings()` para validar que
  `{npc}` pertence ao `{campaign}` da URL pai.
- Para `PUT` com upload usamos method spoofing (`_method: 'put'`) porque
  navegadores não suportam multipart em PUT.

## Comandos úteis

```bash
./vendor/bin/sail artisan route:list --except-vendor
./vendor/bin/sail artisan tinker
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail npm run build
```
