import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CollapsibleText from '@/Components/CollapsibleText';
import DetailModal from '@/Components/DetailModal';
import ZoomableImage from '@/Components/ZoomableImage';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Campaign, Npc, asset } from '@/types/models';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    campaign: Campaign;
    isDm: boolean;
}

export default function CampaignsShow({ campaign, isDm }: Props) {
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [selectedNpcId, setSelectedNpcId] = useState<number | null>(null);

    const selectedLocation = (campaign.locations ?? []).find((location) => location.id === selectedLocationId) ?? null;
    const selectedNpc = (campaign.npcs ?? []).find((npc) => npc.id === selectedNpcId) ?? null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">{campaign.name}</h2>
                    {isDm && (
                        <div className="flex items-center gap-4 text-sm">
                            <Link
                                href={route('campaigns.actions.index', campaign.id)}
                                className="text-indigo-600 hover:underline"
                            >
                                Caixa de ações
                            </Link>
                            <Link
                                href={route('campaigns.edit', campaign.id)}
                                className="text-indigo-600 hover:underline"
                            >
                                Editar campanha
                            </Link>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={campaign.name} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6 sm:px-6 lg:px-8">
                    {campaign.synopsis && (
                        <Card title="Sinopse">
                            <CollapsibleText
                                text={campaign.synopsis}
                                expanded={isSynopsisExpanded}
                                onToggle={() => setIsSynopsisExpanded((current) => !current)}
                                contentClassName="text-gray-700"
                                toggleClassName="mt-3 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            />
                        </Card>
                    )}

                    <Card
                        title="Mestre & jogadores"
                        action={isDm && <InviteForm campaignId={campaign.id} />}
                    >
                        <p className="text-sm">
                            <strong>DM:</strong> {campaign.dm?.name} ({campaign.dm?.email})
                        </p>
                        <ul className="mt-3 space-y-1 text-sm">
                            {(campaign.players ?? []).map((p) => (
                                <li key={p.id} className="flex items-center justify-between">
                                    <span>
                                        {p.name} <span className="text-gray-500">— {p.email}</span>
                                    </span>
                                    {isDm && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm(`Remover ${p.name}?`)) {
                                                    router.delete(route('campaigns.members.destroy', [campaign.id, p.id]));
                                                }
                                            }}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            remover
                                        </button>
                                    )}
                                </li>
                            ))}
                            {(campaign.players ?? []).length === 0 && (
                                <li className="text-sm text-gray-500">Nenhum jogador ainda.</li>
                            )}
                        </ul>
                    </Card>

                    <ResourceSection
                        title="Cenários (Locations)"
                        items={campaign.locations ?? []}
                        createHref={isDm ? route('campaigns.locations.create', campaign.id) : undefined}
                        editHref={(l) => route('locations.edit', l.id)}
                        deleteRoute={(l) => route('locations.destroy', l.id)}
                        canEdit={isDm}
                        onSelect={(id) => setSelectedLocationId((current) => current === id ? null : id)}
                        selectedId={selectedLocationId}
                        render={(l) => (
                            <div className="flex items-center gap-3">
                                {l.background_path && (
                                    <img
                                        src={asset(l.background_path)}
                                        alt=""
                                        className="h-12 w-20 rounded object-cover"
                                    />
                                )}
                                <div>
                                    <div className="font-medium">{l.name}</div>
                                    {l.description && (
                                        <div className="text-xs text-gray-500 line-clamp-1">{l.description}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    />

                    <ResourceSection
                        title="NPCs"
                        items={campaign.npcs ?? []}
                        createHref={isDm ? route('campaigns.npcs.create', campaign.id) : undefined}
                        editHref={(n) => route('npcs.edit', n.id)}
                        deleteRoute={(n) => route('npcs.destroy', n.id)}
                        canEdit={isDm}
                        onSelect={(id) => setSelectedNpcId((current) => current === id ? null : id)}
                        selectedId={selectedNpcId}
                        render={(n) => (
                            <div className="flex items-center gap-3">
                                {getNpcImagePath(n) && (
                                    <img
                                        src={asset(getNpcImagePath(n))}
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <div className="font-medium">{n.name}</div>
                                    {n.role && <div className="text-xs text-gray-500">{n.role}</div>}
                                </div>
                            </div>
                        )}
                    />

                    <ResourceSection
                        title="Personagens dos jogadores"
                        items={campaign.characters ?? []}
                        createHref={route('campaigns.characters.create', campaign.id)}
                        editHref={(c) => route('characters.edit', c.id)}
                        deleteRoute={(c) => route('characters.destroy', c.id)}
                        canEdit
                        render={(c) => (
                            <div className="flex items-center gap-3">
                                {c.portrait_path && (
                                    <img
                                        src={asset(c.portrait_path)}
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <div className="font-medium">
                                        {c.name}{' '}
                                        <span className="text-xs text-gray-500">
                                            (nv. {c.level} {c.race} {c.class})
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        HP {c.hp_current}/{c.hp_max} • {c.user?.name}
                                    </div>
                                </div>
                            </div>
                        )}
                    />

                    <ResourceSection
                        title="Missões"
                        items={campaign.quests ?? []}
                        createHref={isDm ? route('campaigns.quests.create', campaign.id) : undefined}
                        editHref={(q) => route('quests.edit', q.id)}
                        deleteRoute={(q) => route('quests.destroy', q.id)}
                        canEdit={isDm}
                        render={(q) => (
                            <div>
                                <div className="font-medium">
                                    {q.title}{' '}
                                    <span className={statusBadge(q.status)}>{q.status}</span>
                                </div>
                                {q.description && (
                                    <div className="text-xs text-gray-500 line-clamp-2">{q.description}</div>
                                )}
                            </div>
                        )}
                    />

                    <ResourceSection
                        title="Cenas"
                        items={campaign.scenes ?? []}
                        createHref={isDm ? route('campaigns.scenes.create', campaign.id) : undefined}
                        editHref={(s) => isDm ? route('scenes.edit', s.id) : route('scenes.show', s.id)}
                        deleteRoute={(s) => route('scenes.destroy', s.id)}
                        canEdit={isDm}
                        editLabel={isDm ? 'editar' : 'jogar'}
                        render={(s) => (
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="font-medium">{s.title}</div>
                                    {s.summary && (
                                        <div className="text-xs text-gray-500 line-clamp-1">{s.summary}</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={
                                            'rounded px-2 py-0.5 text-xs ' +
                                            (s.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-yellow-100 text-yellow-700')
                                        }
                                    >
                                        {s.status}
                                    </span>
                                    {(isDm || s.status === 'published') && (
                                        <Link
                                            href={route('scenes.show', s.id)}
                                            className="text-xs text-indigo-600 hover:underline"
                                        >
                                            ▶ jogar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>

            <DetailModal
                show={selectedLocation !== null}
                title={selectedLocation?.name ?? ''}
                onClose={() => setSelectedLocationId(null)}
            >
                {selectedLocation && (
                    <div className="space-y-4">
                        {selectedLocation.background_path ? (
                            <ZoomableImage
                                src={asset(selectedLocation.background_path) ?? ''}
                                alt={selectedLocation.name}
                            />
                        ) : (
                            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                                Sem imagem para este cenário.
                            </div>
                        )}
                        <p className="whitespace-pre-line text-sm text-gray-700">
                            {selectedLocation.description || 'Este cenário ainda não possui descrição.'}
                        </p>
                    </div>
                )}
            </DetailModal>

            <DetailModal
                show={selectedNpc !== null}
                title={selectedNpc?.name ?? ''}
                titleCentered
                onClose={() => setSelectedNpcId(null)}
            >
                {selectedNpc && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {getNpcImagePath(selectedNpc) ? (
                            <ZoomableImage
                                src={asset(getNpcImagePath(selectedNpc)) ?? ''}
                                alt={selectedNpc.name}
                            />
                        ) : (
                            <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                                Sem retrato disponível.
                            </div>
                        )}
                        <div className="space-y-2">
                            {selectedNpc.role && (
                                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                                    {selectedNpc.role}
                                </p>
                            )}
                            <p className="whitespace-pre-line text-sm text-gray-700">
                                {selectedNpc.description || 'Este NPC ainda não possui descrição.'}
                            </p>
                        </div>
                    </div>
                )}
            </DetailModal>
        </AuthenticatedLayout>
    );
}

function Card({
    title,
    action,
    children,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                {action}
            </div>
            {children}
        </section>
    );
}

interface ResourceItem { id: number }

function ResourceSection<T extends ResourceItem>({
    title,
    items,
    createHref,
    editHref,
    deleteRoute,
    canEdit,
    editLabel = 'editar',
    onSelect,
    selectedId,
    render,
}: {
    title: string;
    items: T[];
    createHref?: string;
    editHref: (i: T) => string;
    deleteRoute: (i: T) => string;
    canEdit: boolean;
    editLabel?: string;
    onSelect?: (id: number) => void;
    selectedId?: number | null;
    render: (i: T) => React.ReactNode;
}) {
    return (
        <Card
            title={title}
            action={
                createHref && (
                    <Link
                        href={createHref}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                        + Adicionar
                    </Link>
                )
            }
        >
            {items.length === 0 ? (
                <p className="text-sm text-gray-500">Nada por aqui ainda.</p>
            ) : (
                <>
                    <ul className="divide-y">
                        {items.map((i) => (
                            <li key={i.id} className="flex items-center justify-between py-2">
                                <div className="flex-1">
                                    {onSelect ? (
                                        <button
                                            type="button"
                                            onClick={() => onSelect(i.id)}
                                            className={
                                                'w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-50 ' +
                                                (selectedId === i.id ? 'bg-indigo-50 ring-1 ring-indigo-100' : '')
                                            }
                                        >
                                            {render(i)}
                                        </button>
                                    ) : (
                                        <div>{render(i)}</div>
                                    )}
                                </div>
                                {canEdit && (
                                    <div className="ml-4 flex items-center gap-3 text-xs">
                                        <Link href={editHref(i)} className="text-indigo-600 hover:underline">
                                            {editLabel}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('Excluir?')) router.delete(deleteRoute(i));
                                            }}
                                            className="text-red-600 hover:underline"
                                        >
                                            excluir
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Card>
    );
}

function getNpcImagePath(campaignNpc: Npc): string | null {
    if (campaignNpc.portrait_path) {
        return campaignNpc.portrait_path;
    }

    const defaultExpression =
        campaignNpc.expressions?.find((expression: NonNullable<Npc['expressions']>[number]) => expression.is_default) ?? campaignNpc.expressions?.[0];

    return defaultExpression?.sprite_path ?? null;
}

function InviteForm({ campaignId }: { campaignId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post(route('campaigns.members.store', campaignId), {
                    onSuccess: () => reset('email'),
                });
            }}
            className="flex items-end gap-2"
        >
            <div>
                <InputLabel htmlFor="email" value="Convidar por e-mail" />
                <TextInput
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 w-64"
                    required
                />
                <InputError message={errors.email} className="mt-1" />
            </div>
            <PrimaryButton disabled={processing}>Convidar</PrimaryButton>
        </form>
    );
}

function statusBadge(status: string): string {
    const base = 'ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide';
    if (status === 'completed') return `${base} bg-emerald-100 text-emerald-700`;
    if (status === 'failed') return `${base} bg-red-100 text-red-700`;
    return `${base} bg-amber-100 text-amber-700`;
}
