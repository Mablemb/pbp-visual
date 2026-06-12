<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CampaignMemberController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\CharacterExpressionController;
use App\Http\Controllers\DamageEventController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\NpcController;
use App\Http\Controllers\NpcExpressionController;
use App\Http\Controllers\PlayerActionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestController;
use App\Http\Controllers\SceneController;
use App\Http\Controllers\SceneLineController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [CampaignController::class, 'index'])->name('dashboard');

    // Top-level campaign resource. Players can browse campaigns they belong
    // to; only DMs can create / edit / delete (enforced by CampaignPolicy).
    Route::resource('campaigns', CampaignController::class);

    // Campaign-scoped members (no shallow form needed — always tied to a campaign).
    Route::scopeBindings()->prefix('campaigns/{campaign}')->group(function () {
        Route::post('members', [CampaignMemberController::class, 'store'])->name('campaigns.members.store');
        Route::delete('members/{user}', [CampaignMemberController::class, 'destroy'])->name('campaigns.members.destroy');
    });

    // Shallow-nested child resources: index/create/store live under
    // /campaigns/{campaign}/..., but edit/update/destroy live at /<resource>/{id}/...
    Route::resource('campaigns.locations', LocationController::class)->except(['show'])->shallow()->scoped();
    Route::resource('campaigns.npcs', NpcController::class)->except(['show'])->shallow()->scoped();
    Route::resource('campaigns.characters', CharacterController::class)->except(['show'])->shallow()->scoped();
    Route::resource('campaigns.quests', QuestController::class)->except(['show'])->shallow()->scoped();

    // Scenes: shallow-nested. Player viewer is `scenes.show`.
    Route::resource('campaigns.scenes', SceneController::class)
        ->except(['index'])
        ->shallow()
        ->scoped();

    // Scene lines (nested under scene, never standalone).
    Route::scopeBindings()->prefix('scenes/{scene}')->group(function () {
        Route::post('lines', [SceneLineController::class, 'store'])->name('scenes.lines.store');
        Route::put('lines/reorder', [SceneLineController::class, 'reorder'])->name('scenes.lines.reorder');
        Route::post('actions/{action}/import', [SceneLineController::class, 'importAction'])
            ->name('scenes.actions.import');
    });
    Route::scopeBindings()->prefix('lines/{line}')->group(function () {
        Route::put('/', [SceneLineController::class, 'update'])->name('scenes.lines.update');
        Route::delete('/', [SceneLineController::class, 'destroy'])->name('scenes.lines.destroy');
        Route::post('damages', [DamageEventController::class, 'store'])->name('lines.damages.store');
    });
    Route::delete('damages/{damage}', [DamageEventController::class, 'destroy'])->name('damages.destroy');

    // Player actions: posted on a scene, listed in DM inbox per campaign.
    Route::post('scenes/{scene}/actions', [PlayerActionController::class, 'store'])
        ->name('scenes.actions.store');
    Route::get('campaigns/{campaign}/actions', [PlayerActionController::class, 'index'])
        ->name('campaigns.actions.index');
    Route::put('actions/{action}', [PlayerActionController::class, 'update'])
        ->name('actions.update');
    Route::delete('actions/{action}', [PlayerActionController::class, 'destroy'])
        ->name('actions.destroy');

    // NPC expression sub-resource (sprite per emotion).
    Route::scopeBindings()->prefix('npcs/{npc}')->group(function () {
        Route::delete('portrait', [NpcController::class, 'destroyPortrait'])->name('npcs.portrait.destroy');
        Route::post('expressions', [NpcExpressionController::class, 'store'])->name('npcs.expressions.store');
        Route::patch('expressions/{expression}/default', [NpcExpressionController::class, 'setDefault'])->name('npcs.expressions.default');
        Route::delete('expressions/{expression}', [NpcExpressionController::class, 'destroy'])->name('npcs.expressions.destroy');
    });

    // Character expression sub-resource (sprite per emotion).
    Route::scopeBindings()->prefix('characters/{character}')->group(function () {
        Route::delete('portrait', [CharacterController::class, 'destroyPortrait'])->name('characters.portrait.destroy');
        Route::post('expressions', [CharacterExpressionController::class, 'store'])->name('characters.expressions.store');
        Route::patch('expressions/{expression}/default', [CharacterExpressionController::class, 'setDefault'])->name('characters.expressions.default');
        Route::delete('expressions/{expression}', [CharacterExpressionController::class, 'destroy'])->name('characters.expressions.destroy');
    });

    // Location background delete.
    Route::delete('locations/{location}/background', [LocationController::class, 'destroyBackground'])->name('locations.background.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
