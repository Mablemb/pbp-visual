import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { CharacterExpression, DamageEvent, PlayerAction, Scene, SceneLine, asset } from '@/types/models';
import { DAMAGE_TYPES, DamageType } from '@/types/damage';

type MyCharacter = {
    id: number;
    name: string;
    portrait_path?: string | null;
    expressions?: CharacterExpression[];
};

interface Props {
    scene: Scene & { lines: SceneLine[]; actions?: PlayerAction[] };
    isDm: boolean;
    myCharacters: MyCharacter[];
}

/**
 * Visual-novel-style scene viewer:
 *  - Full-screen background (from Location).
 *  - NPC sprite centered.
 *  - Translucent dialog box at the bottom with name + body.
 *  - "Próximo" (or Space/Enter/→) advances; at the end, returns to campaign.
 *  - End screen lets players post a free-text action.
 */
export default function ScenesShow({ scene, isDm, myCharacters }: Props) {
    const [idx, setIdx] = useState(0);
    const lines = scene.lines;
    const line: SceneLine | undefined = lines[idx];
    const isEnd = idx >= lines.length;

    function next() {
        setIdx((i) => Math.min(i + 1, lines.length));
    }
    function prev() {
        setIdx((i) => Math.max(i - 1, 0));
    }

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Ignore when the user is typing in an input/textarea/contenteditable.
            const t = e.target as HTMLElement | null;
            if (
                t &&
                (t.tagName === 'INPUT' ||
                    t.tagName === 'TEXTAREA' ||
                    t.tagName === 'SELECT' ||
                    t.isContentEditable)
            ) {
                return;
            }
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
                e.preventDefault();
                next();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prev();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lines.length]);

    const bg = scene.location?.background_path
        ? asset(scene.location.background_path)
        : undefined;

    return (
        <div
            className="relative min-h-screen w-full select-none overflow-hidden bg-gray-900"
            onClick={next}
        >
            <Head title={scene.title} />

            {/* Background */}
            {bg ? (
                <img
                    src={bg}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950" />
            )}

            {/* Top bar */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Link
                    href={route('campaigns.show', scene.campaign_id)}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                >
                    ← Voltar à campanha
                </Link>
                <div className="font-semibold">{scene.title}</div>
                <div className="text-xs opacity-70">
                    {Math.min(idx + 1, lines.length)} / {lines.length}
                    {isDm && scene.status === 'draft' && (
                        <span className="ml-2 rounded bg-yellow-500/80 px-2 py-0.5 text-[10px] font-semibold text-black">
                            RASCUNHO
                        </span>
                    )}
                </div>
            </div>

            {/* NPC sprite */}
            {!isEnd && line?.kind === 'npc' && line.expression?.sprite_path && (
                <img
                    key={line.id}
                    src={asset(line.expression.sprite_path) ?? undefined}
                    alt=""
                    className="absolute bottom-48 left-1/2 z-10 max-h-[60vh] -translate-x-1/2 drop-shadow-2xl"
                />
            )}

            {/* Player character expression sprite (preferred) or portrait */}
            {!isEnd && line?.kind === 'player' && line.character_expression?.sprite_path && (
                <img
                    key={line.id}
                    src={asset(line.character_expression.sprite_path) ?? undefined}
                    alt=""
                    className="absolute bottom-48 left-1/2 z-10 max-h-[60vh] -translate-x-1/2 drop-shadow-2xl"
                />
            )}
            {!isEnd && line?.kind === 'player' && !line.character_expression?.sprite_path && line.character?.portrait_path && (
                <img
                    key={line.id}
                    src={asset(line.character.portrait_path) ?? undefined}
                    alt=""
                    className="absolute bottom-48 left-1/2 z-10 max-h-[60vh] -translate-x-1/2 rounded-lg drop-shadow-2xl"
                />
            )}

            {/* Damage overlay (portraits flashing with damage type tint + floating numbers) */}
            {!isEnd && line && (line.damage_events?.length ?? 0) > 0 && (
                <DamageOverlay key={`dmg-${line.id}`} damages={line.damage_events!} />
            )}

            {/* Dialog box */}
            {!isEnd && line && (
                <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-6 pt-4 sm:px-8">
                    <div className="mx-auto max-w-4xl rounded-xl border border-white/20 bg-black/60 p-6 text-white shadow-2xl backdrop-blur-md">
                        {line.kind === 'npc' && line.npc ? (
                            <div className="mb-2 text-lg font-bold text-amber-300">
                                {line.npc.name}
                            </div>
                        ) : line.kind === 'player' ? (
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-lg font-bold text-emerald-300">
                                    {line.character?.name ?? 'Jogador'}
                                </span>
                                {line.player_kind === 'action' && (
                                    <span className="rounded bg-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                                        ação
                                    </span>
                                )}
                                {line.player_kind === 'dialogue' && (
                                    <span className="rounded bg-sky-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200">
                                        fala
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="mb-2 text-sm italic text-gray-300">
                                — narração —
                            </div>
                        )}
                        <div className="whitespace-pre-wrap text-lg leading-relaxed">
                            {line.body}
                        </div>
                        {(line.damage_events?.length ?? 0) > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {line.damage_events!.map((d) => {
                                    const meta = DAMAGE_TYPES[d.damage_type as DamageType];
                                    return (
                                        <span
                                            key={d.id}
                                            className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm"
                                            style={{ borderColor: meta?.color ?? '#ef4444', color: meta?.color ?? '#ef4444' }}
                                        >
                                            <span>{meta?.icon ?? '❤️‍🔥'}</span>
                                            <span className="font-semibold text-white">{d.character?.name ?? d.npc?.name ?? '?'}</span>
                                            <span className="font-bold">−{d.amount}</span>
                                            <span className="text-xs opacity-80">{meta?.label ?? d.damage_type}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <span className="animate-pulse text-sm text-white/70">
                                Clique, espaço ou → para continuar
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* End screen */}
            {isEnd && (
                <div
                    className="absolute inset-0 z-20 overflow-y-auto bg-black/70"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-12">
                        <div className="rounded-lg bg-white p-8 text-center shadow-2xl">
                            <h2 className="mb-2 text-2xl font-bold">Fim da cena</h2>
                            <p className="mb-6 text-gray-600">"{scene.title}"</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIdx(0)}
                                    className="rounded border border-indigo-600 px-4 py-2 text-indigo-600 hover:bg-indigo-50"
                                >
                                    Reler do início
                                </button>
                                <Link
                                    href={route('campaigns.show', scene.campaign_id)}
                                    className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                >
                                    Voltar à campanha
                                </Link>
                            </div>
                        </div>

                        <ActionForm scene={scene} myCharacters={myCharacters} />
                        <ActionsList actions={scene.actions ?? []} isDm={isDm} />
                    </div>
                </div>
            )}

            {/* Empty scene */}
            {lines.length === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="rounded-lg bg-white/90 p-6 text-gray-700">
                        Esta cena ainda não tem linhas.
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionForm({
    scene,
    myCharacters,
}: {
    scene: Scene;
    myCharacters: MyCharacter[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        body: string;
        character_id: string;
        kind: 'action' | 'dialogue';
        character_expression_id: string;
    }>({
        body: '',
        character_id: myCharacters[0]?.id ? String(myCharacters[0].id) : '',
        kind: 'action',
        character_expression_id: '',
    });

    const selectedChar = useMemo(
        () => myCharacters.find((c) => String(c.id) === data.character_id),
        [myCharacters, data.character_id],
    );
    const expressions = selectedChar?.expressions ?? [];

    // Auto-pick the default expression when character changes.
    useEffect(() => {
        if (!expressions.length) {
            if (data.character_expression_id !== '') setData('character_expression_id', '');
            return;
        }
        const stillValid = expressions.some(
            (e) => String(e.id) === data.character_expression_id,
        );
        if (!stillValid) {
            const def = expressions.find((e) => e.is_default) ?? expressions[0];
            setData('character_expression_id', String(def.id));
        }
    }, [data.character_id]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post(route('scenes.actions.store', scene.id), {
                    preserveScroll: true,
                    onSuccess: () => reset('body'),
                });
            }}
            className="rounded-lg bg-white p-6 shadow-2xl"
        >
            <h3 className="mb-3 text-lg font-semibold">O que seu personagem faz?</h3>

            {myCharacters.length > 0 && (
                <div className="mb-3">
                    <label htmlFor="character_id" className="mb-1 block text-sm font-medium text-gray-700">
                        Personagem
                    </label>
                    <select
                        id="character_id"
                        value={data.character_id}
                        onChange={(e) => setData('character_id', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">— sem personagem —</option>
                        {myCharacters.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.character_id && (
                        <p className="mt-1 text-xs text-red-600">{errors.character_id}</p>
                    )}
                </div>
            )}

            <div className="mb-3">
                <span className="mb-1 block text-sm font-medium text-gray-700">Tipo</span>
                <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-sm">
                        <input
                            type="radio"
                            name="kind"
                            value="action"
                            checked={data.kind === 'action'}
                            onChange={() => setData('kind', 'action')}
                        />
                        <span>Ação <span className="text-xs text-gray-500">(explorar, atacar, usar item…)</span></span>
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                        <input
                            type="radio"
                            name="kind"
                            value="dialogue"
                            checked={data.kind === 'dialogue'}
                            onChange={() => setData('kind', 'dialogue')}
                        />
                        <span>Fala <span className="text-xs text-gray-500">(conversar, gritar, resmungar…)</span></span>
                    </label>
                </div>
                {errors.kind && <p className="mt-1 text-xs text-red-600">{errors.kind}</p>}
            </div>

            {expressions.length > 0 && (
                <div className="mb-3">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Expressão</span>
                    <div className="flex flex-wrap gap-2">
                        {expressions.map((e) => {
                            const selected = String(e.id) === data.character_expression_id;
                            return (
                                <button
                                    type="button"
                                    key={e.id}
                                    onClick={() => setData('character_expression_id', String(e.id))}
                                    className={
                                        'rounded border p-1 text-center transition ' +
                                        (selected
                                            ? 'border-indigo-500 ring-2 ring-indigo-300'
                                            : 'border-gray-200 hover:border-gray-400')
                                    }
                                    title={e.label}
                                >
                                    <img
                                        src={asset(e.sprite_path) ?? undefined}
                                        alt={e.label}
                                        className="h-16 w-16 rounded object-cover"
                                    />
                                    <div className="text-[10px]">{e.label}</div>
                                </button>
                            );
                        })}
                    </div>
                    {errors.character_expression_id && (
                        <p className="mt-1 text-xs text-red-600">{errors.character_expression_id}</p>
                    )}
                </div>
            )}

            <textarea
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                rows={4}
                required
                placeholder={
                    data.kind === 'dialogue'
                        ? 'Ex.: "Não vamos a lugar nenhum sem ouro!"'
                        : 'Ex.: Saco minha adaga e me aproximo da janela…'
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}

            <button
                type="submit"
                disabled={processing}
                className="mt-3 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                Enviar
            </button>
        </form>
    );
}

function ActionsList({
    actions,
    isDm,
}: {
    actions: PlayerAction[];
    isDm: boolean;
}) {
    if (actions.length === 0) {
        return (
            <div className="rounded-lg bg-white/90 p-4 text-center text-sm text-gray-500 shadow">
                Nenhuma ação registrada nesta cena ainda.
            </div>
        );
    }
    return (
        <div className="rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold">Ações nesta cena</h3>
            <ul className="space-y-3">
                {actions.map((a) => (
                    <li key={a.id} className="rounded border border-gray-200 p-3">
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">{a.user?.name}</span>
                                {a.character && <span>· como <em>{a.character.name}</em></span>}
                                {a.kind === 'action' && (
                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                                        ação
                                    </span>
                                )}
                                {a.kind === 'dialogue' && (
                                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-700">
                                        fala
                                    </span>
                                )}
                                {a.character_expression?.sprite_path && (
                                    <img
                                        src={asset(a.character_expression.sprite_path) ?? undefined}
                                        alt={a.character_expression.label}
                                        className="h-6 w-6 rounded object-cover"
                                        title={a.character_expression.label}
                                    />
                                )}
                            </span>
                            <span
                                className={
                                    'rounded px-2 py-0.5 ' +
                                    (a.status === 'resolved'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-yellow-100 text-yellow-700')
                                }
                            >
                                {a.status}
                            </span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-gray-800">{a.body}</div>
                        {a.dm_notes && (
                            <div className="mt-2 rounded bg-indigo-50 p-2 text-xs text-indigo-900">
                                <strong>Nota do DM:</strong> {a.dm_notes}
                            </div>
                        )}
                        {isDm && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!confirm('Excluir esta ação?')) return;
                                    router.delete(route('actions.destroy', a.id), { preserveScroll: true });
                                }}
                                className="mt-2 text-xs text-red-600 hover:underline"
                            >
                                excluir
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function DamageOverlay({ damages }: { damages: DamageEvent[] }) {
    // Group damages by target (character or npc) so a single sprite shows all hits.
    const byTarget = useMemo(() => {
        type Entry = {
            kind: 'character' | 'npc';
            target: DamageEvent['character'] | DamageEvent['npc'];
            hits: DamageEvent[];
        };
        const map = new Map<string, Entry>();
        for (const d of damages) {
            const kind: 'character' | 'npc' = d.npc_id ? 'npc' : 'character';
            const id = d.npc_id ?? d.character_id ?? 0;
            const key = `${kind}:${id}`;
            if (!map.has(key)) {
                map.set(key, {
                    kind,
                    target: kind === 'npc' ? d.npc : d.character,
                    hits: [],
                });
            }
            map.get(key)!.hits.push(d);
        }
        return Array.from(map.values());
    }, [damages]);

    return (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center gap-6 px-4">
            {byTarget.map(({ kind, target, hits }) => {
                const total = hits.reduce((s, h) => s + h.amount, 0);
                const primary = hits[0];
                const meta = DAMAGE_TYPES[primary.damage_type as DamageType];
                const color = meta?.color ?? '#ef4444';
                return (
                    <div
                        key={primary.id}
                        className="relative flex flex-col items-center"
                        style={{ ['--damage-color' as never]: color }}
                    >
                        {target?.portrait_path ? (
                            <img
                                src={asset(target.portrait_path) ?? undefined}
                                alt={target.name}
                                className="animate-damage-flash h-32 w-32 rounded-lg object-cover shadow-2xl sm:h-40 sm:w-40"
                            />
                        ) : (
                            <div
                                className="animate-damage-flash flex h-32 w-32 items-center justify-center rounded-lg bg-gray-800 text-3xl text-white shadow-2xl sm:h-40 sm:w-40"
                            >
                                {target?.name?.[0] ?? '?'}
                            </div>
                        )}
                        <div
                            className="animate-damage-number absolute left-1/2 top-2 text-5xl font-extrabold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
                            style={{ color }}
                        >
                            −{total}
                        </div>
                        <div className="mt-1 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                            {target?.name ?? '?'}
                            {kind === 'npc' && (
                                <span className="ml-1 rounded bg-amber-500/80 px-1 text-[10px]">NPC</span>
                            )}
                            {target && target.hp_current != null && target.hp_max != null && (
                                <span className="ml-1 text-[10px] opacity-80">
                                    {target.hp_current}/{target.hp_max} HP
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
