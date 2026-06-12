import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AutoTextarea from '@/Components/AutoTextarea';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Character, CharacterExpression, DamageEvent, Npc, NpcExpression, PlayerAction, Scene, SceneLine, asset } from '@/types/models';
import { DAMAGE_TYPES, DAMAGE_TYPE_LIST, DamageType } from '@/types/damage';

type CharacterWithExpressions = Pick<Character, 'id' | 'name' | 'portrait_path'> & {
    expressions: CharacterExpression[];
};

interface Props {
    scene: Scene & { lines: SceneLine[] };
    campaign: { id: number; name: string };
    locations: { id: number; name: string; background_path: string | null }[];
    npcs: (Pick<Npc, 'id' | 'name' | 'portrait_path' | 'hp_current' | 'hp_max'> & { expressions: NpcExpression[] })[];
    characters: CharacterWithExpressions[];
    pendingActions: PlayerAction[];
}

export default function ScenesEdit({ scene, campaign, locations, npcs, characters, pendingActions }: Props) {
    const [lines, setLines] = useState<SceneLine[]>(scene.lines);

    useEffect(() => {
        console.log('[ScenesEdit] scene.lines changed', scene.lines.length);
        setLines(scene.lines);
    }, [scene.lines]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-800">
                        <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                            ← {campaign.name}
                        </Link>
                        <h2 className="text-xl font-semibold">/ Editar cena</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('scenes.show', scene.id)}
                            className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
                        >
                            Pré-visualizar
                        </Link>
                        <PublishToggle scene={scene} />
                    </div>
                </div>
            }
        >
            <Head title={`Cena: ${scene.title}`} />
            <div className="space-y-6 py-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Metadata scene={scene} locations={locations} />
                    <PendingActionsPanel scene={scene} actions={pendingActions} />
                    <LinesEditor
                        scene={scene}
                        lines={lines}
                        setLines={setLines}
                        npcs={npcs}
                        characters={characters}
                    />
                    <AddLineForm scene={scene} npcs={npcs} characters={characters} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function PendingActionsPanel({ scene, actions }: { scene: Scene; actions: PlayerAction[] }) {
    if (actions.length === 0) return null;
    return (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-amber-800">
                Ações pendentes dos jogadores ({actions.length})
            </h3>
            <ul className="space-y-2">
                {actions.map((a) => (
                    <li key={a.id} className="rounded border border-amber-200 bg-white p-3">
                        <div className="mb-1 flex items-center gap-2 text-xs text-gray-600">
                            {a.character?.portrait_path && (
                                <img
                                    src={asset(a.character.portrait_path) ?? undefined}
                                    alt=""
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            )}
                            <span className="font-semibold text-gray-800">
                                {a.character?.name ?? a.user?.name ?? 'Jogador'}
                            </span>
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
                                    title={a.character_expression.label}
                                    className="h-6 w-6 rounded object-cover"
                                />
                            )}
                            <span className="text-gray-400">·</span>
                            <span>{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-800">{a.body}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    router.post(
                                        route('scenes.actions.import', [scene.id, a.id]),
                                        {},
                                        { preserveScroll: true },
                                    );
                                }}
                                className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                                Importar como linha
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    router.put(
                                        route('actions.update', a.id),
                                        { status: 'resolved' },
                                        { preserveScroll: true },
                                    );
                                }}
                                className="rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            >
                                Marcar resolvida
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Excluir esta ação?')) {
                                        router.delete(route('actions.destroy', a.id), { preserveScroll: true });
                                    }
                                }}
                                className="rounded border border-red-300 bg-white px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                            >
                                Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function PublishToggle({ scene }: { scene: Scene }) {
    const next = scene.status === 'published' ? 'draft' : 'published';
    const label = scene.status === 'published' ? 'Despublicar' : 'Publicar';
    return (
        <button
            type="button"
            onClick={() => {
                router.put(route('scenes.update', scene.id), {
                    title: scene.title,
                    summary: scene.summary ?? '',
                    location_id: scene.location_id ?? '',
                    status: next,
                }, { preserveScroll: true });
            }}
            className={
                'rounded px-3 py-1.5 text-sm text-white ' +
                (scene.status === 'published'
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-emerald-600 hover:bg-emerald-700')
            }
        >
            {label}
        </button>
    );
}

function Metadata({
    scene,
    locations,
}: {
    scene: Scene;
    locations: Props['locations'];
}) {
    const { data, setData, put, processing, errors } = useForm({
        title: scene.title,
        summary: scene.summary ?? '',
        location_id: scene.location_id ? String(scene.location_id) : '',
        status: scene.status,
    });

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Metadados</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    put(route('scenes.update', scene.id), { preserveScroll: true });
                }}
                className="space-y-4"
            >
                <div>
                    <InputLabel htmlFor="title" value="Título" />
                    <TextInput
                        id="title"
                        className="mt-1 block w-full"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="location_id" value="Cenário (background)" />
                    <select
                        id="location_id"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={data.location_id}
                        onChange={(e) => setData('location_id', e.target.value)}
                    >
                        <option value="">— sem cenário —</option>
                        {locations.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <InputLabel htmlFor="summary" value="Resumo (DM)" />
                    <AutoTextarea
                        id="summary"
                        className="mt-1 block w-full"
                        rows={2}
                        value={data.summary}
                        onChange={(e) => setData('summary', e.target.value)}
                    />
                </div>
                <PrimaryButton disabled={processing}>Salvar metadados</PrimaryButton>
            </form>
        </div>
    );
}

function LinesEditor({
    scene,
    lines,
    setLines,
    npcs,
    characters,
}: {
    scene: Scene;
    lines: SceneLine[];
    setLines: (lines: SceneLine[]) => void;
    npcs: Props['npcs'];
    characters: Props['characters'];
}) {
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    function commitOrder(next: SceneLine[]) {
        setLines(next);
        router.put(
            route('scenes.lines.reorder', scene.id),
            { order: next.map((l) => l.id) },
            { preserveScroll: true, preserveState: true },
        );
    }

    function onDrop(targetIdx: number) {
        if (dragIdx === null || dragIdx === targetIdx) return;
        const next = [...lines];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(targetIdx, 0, moved);
        commitOrder(next);
        setDragIdx(null);
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
                Linhas <span className="text-sm font-normal text-gray-500">({lines.length})</span>
            </h3>
            {lines.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma linha ainda. Use o formulário abaixo.</p>
            )}
            <ul className="space-y-2">
                {lines.map((line, i) => (
                    <li
                        key={line.id}
                        draggable={editingId !== line.id}
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(i)}
                        className={
                            'flex items-start gap-3 rounded border p-3 transition ' +
                            (dragIdx === i ? 'opacity-40' : 'bg-gray-50 hover:bg-gray-100')
                        }
                    >
                        <span className="cursor-grab select-none text-gray-400" title="Arrastar">⋮⋮</span>
                        <span className="w-6 text-xs font-mono text-gray-400">{i + 1}</span>
                        {editingId === line.id ? (
                            <EditLineForm
                                line={line}
                                npcs={npcs}
                                characters={characters}
                                onCancel={() => setEditingId(null)}
                                onDone={() => setEditingId(null)}
                            />
                        ) : (
                            <div className="flex-1">
                                {line.kind === 'npc' && line.npc ? (
                                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-700">
                                        {line.expression?.sprite_path && (
                                            <img
                                                src={asset(line.expression.sprite_path) ?? undefined}
                                                alt=""
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        )}
                                        {line.npc.name}
                                        {line.expression && (
                                            <span className="text-xs font-normal text-gray-500">
                                                ({line.expression.label})
                                            </span>
                                        )}
                                    </div>
                                ) : line.kind === 'player' ? (
                                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                        {line.character_expression?.sprite_path ? (
                                            <img
                                                src={asset(line.character_expression.sprite_path) ?? undefined}
                                                alt=""
                                                className="h-8 w-8 rounded object-cover"
                                            />
                                        ) : line.character?.portrait_path ? (
                                            <img
                                                src={asset(line.character.portrait_path) ?? undefined}
                                                alt=""
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : null}
                                        {line.character?.name ?? 'Jogador'}
                                        {line.player_kind === 'dialogue' ? (
                                            <span className="rounded bg-sky-100 px-1.5 text-[10px] font-normal text-sky-700">
                                                fala
                                            </span>
                                        ) : (
                                            <span className="rounded bg-emerald-100 px-1.5 text-[10px] font-normal text-emerald-700">
                                                ação
                                            </span>
                                        )}
                                        {line.character_expression && (
                                            <span className="text-xs font-normal text-gray-500">
                                                ({line.character_expression.label})
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mb-1 text-sm italic text-gray-500">Narração</div>
                                )}
                                <div className="whitespace-pre-wrap text-sm text-gray-800">{line.body}</div>
                                <DamagePanel line={line} characters={characters} npcs={npcs} />
                            </div>
                        )}
                        {editingId !== line.id && (
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditingId(line.id)}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!confirm('Remover esta linha?')) return;
                                        router.delete(route('scenes.lines.destroy', line.id), {
                                            preserveScroll: true,
                                            onSuccess: () => setLines(lines.filter((l) => l.id !== line.id)),
                                        });
                                    }}
                                    className="text-xs text-red-600 hover:underline"
                                >
                                    remover
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function EditLineForm({
    line,
    npcs,
    characters,
    onCancel,
    onDone,
}: {
    line: SceneLine;
    npcs: Props['npcs'];
    characters: Props['characters'];
    onCancel: () => void;
    onDone: () => void;
}) {
    const { data, setData, put, processing, errors } = useForm<{
        kind: 'narration' | 'npc' | 'player';
        body: string;
        npc_id: string;
        npc_expression_id: string;
        character_id: string;
        player_kind: 'action' | 'dialogue';
        character_expression_id: string;
    }>({
        kind: line.kind,
        body: line.body,
        npc_id: line.npc_id ? String(line.npc_id) : '',
        npc_expression_id: line.npc_expression_id ? String(line.npc_expression_id) : '',
        character_id: line.character_id ? String(line.character_id) : '',
        player_kind: line.player_kind ?? 'action',
        character_expression_id: line.character_expression_id ? String(line.character_expression_id) : '',
    });

    const selectedNpc = useMemo(
        () => npcs.find((n) => String(n.id) === data.npc_id),
        [npcs, data.npc_id],
    );
    const selectedChar = useMemo(
        () => characters.find((c) => String(c.id) === data.character_id),
        [characters, data.character_id],
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(route('scenes.lines.update', line.id), {
                    preserveScroll: true,
                    onSuccess: () => onDone(),
                });
            }}
            className="flex-1 space-y-3"
        >
            <div className="flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        checked={data.kind === 'narration'}
                        onChange={() => setData('kind', 'narration')}
                    />
                    Narração
                </label>
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        checked={data.kind === 'npc'}
                        onChange={() => setData('kind', 'npc')}
                    />
                    NPC
                </label>
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        checked={data.kind === 'player'}
                        onChange={() => setData('kind', 'player')}
                    />
                    Jogador
                </label>
            </div>

            {data.kind === 'npc' && (
                <div className="grid grid-cols-2 gap-3">
                    <select
                        className="rounded-md border-gray-300 text-sm shadow-sm"
                        value={data.npc_id}
                        onChange={(e) => {
                            setData('npc_id', e.target.value);
                            setData('npc_expression_id', '');
                        }}
                        required
                    >
                        <option value="">— NPC —</option>
                        {npcs.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                    <select
                        className="rounded-md border-gray-300 text-sm shadow-sm"
                        value={data.npc_expression_id}
                        onChange={(e) => setData('npc_expression_id', e.target.value)}
                        disabled={!selectedNpc}
                    >
                        <option value="">— padrão —</option>
                        {selectedNpc?.expressions.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                                {ex.label}{ex.is_default ? ' (padrão)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {data.kind === 'player' && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            className="rounded-md border-gray-300 text-sm shadow-sm"
                            value={data.character_id}
                            onChange={(e) => {
                                setData('character_id', e.target.value);
                                setData('character_expression_id', '');
                            }}
                            required
                        >
                            <option value="">— personagem —</option>
                            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            className="rounded-md border-gray-300 text-sm shadow-sm"
                            value={data.character_expression_id}
                            onChange={(e) => setData('character_expression_id', e.target.value)}
                            disabled={!selectedChar}
                        >
                            <option value="">— sem expressão —</option>
                            {selectedChar?.expressions.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                    {ex.label}{ex.is_default ? ' (padrão)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 text-sm">
                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                checked={data.player_kind === 'action'}
                                onChange={() => setData('player_kind', 'action')}
                            />
                            Ação
                        </label>
                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                checked={data.player_kind === 'dialogue'}
                                onChange={() => setData('player_kind', 'dialogue')}
                            />
                            Fala
                        </label>
                    </div>
                </div>
            )}

            <AutoTextarea
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                rows={3}
                required
                className="block w-full text-sm"
            />
            {errors.body && <p className="text-xs text-red-600">{errors.body}</p>}

            <div className="flex gap-2">
                <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}

function AddLineForm({ scene, npcs, characters }: { scene: Scene; npcs: Props['npcs']; characters: Props['characters'] }) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        kind: 'narration' | 'npc' | 'player';
        body: string;
        npc_id: string;
        npc_expression_id: string;
        character_id: string;
        player_kind: 'action' | 'dialogue';
        character_expression_id: string;
    }>({
        kind: 'narration',
        body: '',
        npc_id: '',
        npc_expression_id: '',
        character_id: '',
        player_kind: 'action',
        character_expression_id: '',
    });

    const selectedNpc = useMemo(
        () => npcs.find((n) => String(n.id) === data.npc_id),
        [npcs, data.npc_id],
    );
    const selectedChar = useMemo(
        () => characters.find((c) => String(c.id) === data.character_id),
        [characters, data.character_id],
    );

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Adicionar linha</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post(route('scenes.lines.store', scene.id), {
                        preserveScroll: true,
                        preserveState: false,
                        onSuccess: () => {
                            reset();
                            router.reload({ only: ['scene'] });
                        },
                    });
                }}
                className="space-y-4"
            >
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="kind"
                            checked={data.kind === 'narration'}
                            onChange={() => setData('kind', 'narration')}
                        />
                        Narração
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="kind"
                            checked={data.kind === 'npc'}
                            onChange={() => setData('kind', 'npc')}
                        />
                        Fala de NPC
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="kind"
                            checked={data.kind === 'player'}
                            onChange={() => setData('kind', 'player')}
                        />
                        Jogador
                    </label>
                </div>
                {data.kind === 'npc' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="npc_id" value="NPC" />
                            <select
                                id="npc_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={data.npc_id}
                                onChange={(e) => {
                                    setData('npc_id', e.target.value);
                                    setData('npc_expression_id', '');
                                }}
                                required
                            >
                                <option value="">— escolha —</option>
                                {npcs.map((n) => (
                                    <option key={n.id} value={n.id}>{n.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.npc_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="npc_expression_id" value="Expressão" />
                            <select
                                id="npc_expression_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={data.npc_expression_id}
                                onChange={(e) => setData('npc_expression_id', e.target.value)}
                                disabled={!selectedNpc}
                            >
                                <option value="">— padrão —</option>
                                {selectedNpc?.expressions.map((ex) => (
                                    <option key={ex.id} value={ex.id}>
                                        {ex.label}{ex.is_default ? ' (padrão)' : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.npc_expression_id} className="mt-2" />
                        </div>
                    </div>
                )}
                {data.kind === 'player' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="character_id" value="Personagem" />
                                <select
                                    id="character_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.character_id}
                                    onChange={(e) => {
                                        setData('character_id', e.target.value);
                                        setData('character_expression_id', '');
                                    }}
                                    required
                                >
                                    <option value="">— escolha —</option>
                                    {characters.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.character_id} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="character_expression_id" value="Expressão" />
                                <select
                                    id="character_expression_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.character_expression_id}
                                    onChange={(e) => setData('character_expression_id', e.target.value)}
                                    disabled={!selectedChar}
                                >
                                    <option value="">— sem expressão —</option>
                                    {selectedChar?.expressions.map((ex) => (
                                        <option key={ex.id} value={ex.id}>
                                            {ex.label}{ex.is_default ? ' (padrão)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={data.player_kind === 'action'}
                                    onChange={() => setData('player_kind', 'action')}
                                />
                                Ação
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={data.player_kind === 'dialogue'}
                                    onChange={() => setData('player_kind', 'dialogue')}
                                />
                                Fala
                            </label>
                        </div>
                    </div>
                )}
                <div>
                    <InputLabel htmlFor="body" value="Texto" />
                    <AutoTextarea
                        id="body"
                        className="mt-1 block w-full"
                        rows={3}
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        required
                    />
                    <InputError message={errors.body} className="mt-2" />
                </div>
                <PrimaryButton disabled={processing}>Adicionar</PrimaryButton>
            </form>
        </div>
    );
}


type DamageTarget = {
    kind: 'character' | 'npc';
    id: number;
    name: string;
    hp_current?: number;
    hp_max?: number;
};

function DamagePanel({
    line,
    characters,
    npcs,
}: {
    line: SceneLine;
    characters: Props['characters'];
    npcs: Props['npcs'];
}) {
    const damages = line.damage_events ?? [];
    const [open, setOpen] = useState(false);

    const targets: DamageTarget[] = [
        ...characters.map((c) => ({
            kind: 'character' as const,
            id: c.id,
            name: c.name,
        })),
        ...npcs.map((n) => ({
            kind: 'npc' as const,
            id: n.id,
            name: n.name,
            hp_current: n.hp_current,
            hp_max: n.hp_max,
        })),
    ];

    const firstTarget = targets[0];
    const { data, setData, post, processing, errors, reset } = useForm<{
        target: string;
        amount: string;
        damage_type: DamageType;
    }>({
        target: firstTarget ? `${firstTarget.kind}:${firstTarget.id}` : '',
        amount: '1',
        damage_type: 'bludgeoning',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        const [kind, idStr] = data.target.split(':');
        if (!kind || !idStr) return;
        router.post(
            route('lines.damages.store', line.id),
            {
                target_kind: kind,
                target_id: Number(idStr),
                amount: Number(data.amount),
                damage_type: data.damage_type,
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    reset('amount');
                    setOpen(false);
                },
            },
        );
    }

    return (
        <div className="mt-2">
            {damages.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-1">
                    {damages.map((d: DamageEvent) => {
                        const meta = DAMAGE_TYPES[d.damage_type as DamageType];
                        const targetName = d.character?.name ?? d.npc?.name ?? '?';
                        const isNpc = !!d.npc_id;
                        return (
                            <li
                                key={d.id}
                                className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                                style={{ borderColor: meta?.color ?? '#ef4444', color: meta?.color ?? '#ef4444' }}
                            >
                                <span>{meta?.icon ?? '⚠️'}</span>
                                <span className="font-semibold text-gray-800">
                                    {targetName}
                                </span>
                                {isNpc && (
                                    <span className="rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-800">NPC</span>
                                )}
                                <span className="font-bold">−{d.amount}</span>
                                <span className="opacity-70">{meta?.label ?? d.damage_type}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!confirm('Remover este dano? O HP será restaurado.')) return;
                                        router.delete(route('damages.destroy', d.id), {
                                            preserveScroll: true,
                                            preserveState: false,
                                        });
                                    }}
                                    className="ml-1 text-gray-500 hover:text-red-600"
                                    title="Remover"
                                >
                                    ×
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
            {!open ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="rounded border border-red-300 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                    + Dano
                </button>
            ) : targets.length > 0 ? (
                <form
                    onSubmit={submit}
                    className="flex flex-wrap items-center gap-2 rounded border border-red-200 bg-red-50/50 p-2"
                >
                    <select
                        value={data.target}
                        onChange={(e) => setData('target', e.target.value)}
                        required
                        className="rounded-md border-gray-300 text-xs shadow-sm"
                    >
                        {characters.length > 0 && (
                            <optgroup label="Jogadores">
                                {characters.map((c) => (
                                    <option key={`c-${c.id}`} value={`character:${c.id}`}>
                                        {c.name}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        {npcs.length > 0 && (
                            <optgroup label="NPCs">
                                {npcs.map((n) => (
                                    <option key={`n-${n.id}`} value={`npc:${n.id}`}>
                                        {n.name}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                    <input
                        type="number"
                        min={1}
                        max={999}
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        required
                        className="w-16 rounded-md border-gray-300 text-xs shadow-sm"
                    />
                    <select
                        value={data.damage_type}
                        onChange={(e) => setData('damage_type', e.target.value as DamageType)}
                        className="rounded-md border-gray-300 text-xs shadow-sm"
                    >
                        {DAMAGE_TYPE_LIST.map((t) => (
                            <option key={t} value={t}>
                                {DAMAGE_TYPES[t].icon} {DAMAGE_TYPES[t].label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        Aplicar
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-xs text-gray-600 hover:underline"
                    >
                        cancelar
                    </button>
                    {(() => {
                        const e = errors as Record<string, string | undefined>;
                        const msg = e.target_kind || e.target_id || e.target || e.amount || e.damage_type;
                        return msg ? (
                            <span className="text-xs text-red-600">{msg}</span>
                        ) : null;
                    })()}
                </form>
            ) : (
                <p className="text-xs text-gray-500">Crie um personagem ou NPC para registrar dano.</p>
            )}
        </div>
    );
}
