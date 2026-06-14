import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteImageButton from '@/Components/DeleteImageButton';
import ImageSourcePicker from '@/Components/ImageSourcePicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Npc, asset } from '@/types/models';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { NpcForm, NpcFormData } from './Create';

interface Props {
    campaign: { id: number; name: string };
    npc: Npc;
    expressionLabels: string[];
}

export default function NpcsEdit({ campaign, npc, expressionLabels }: Props) {
    const { features } = usePage<PageProps>().props;

    const expr = useForm<{
        label: string;
        sprite_source: '' | 'upload' | 'ai' | 'existing';
        sprite: File | null;
        sprite_prompt: string;
        sprite_refs: File[];
        sprite_existing_refs: string[];
        sprite_existing_path: string;
    }>({
        label: expressionLabels[0] ?? 'neutral',
        sprite_source: '',
        sprite: null,
        sprite_prompt: '',
        sprite_refs: [],
        sprite_existing_refs: [],
        sprite_existing_path: '',
    });

    const existingRefs = (npc.expressions ?? []).map((e) => ({
        label: e.label,
        path: e.sprite_path,
    }));

    const initial: NpcFormData = {
        _method: 'put',
        name: npc.name,
        role: npc.role ?? '',
        description: npc.description ?? '',
        race: npc.race ?? '',
        class: npc.class ?? '',
        level: npc.level ?? 1,
        hp_max: npc.hp_max ?? 10,
        hp_current: npc.hp_current ?? 10,
        strength: npc.strength ?? 10,
        dexterity: npc.dexterity ?? 10,
        constitution: npc.constitution ?? 10,
        intelligence: npc.intelligence ?? 10,
        wisdom: npc.wisdom ?? 10,
        charisma: npc.charisma ?? 10,
        bio: npc.bio ?? '',
        portrait_source: '',
        portrait: null,
        portrait_prompt: '',
        portrait_refs: [],
        portrait_existing_refs: [],
        portrait_existing_path: '',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">
                        / NPC: {npc.name}
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 align-middle">
                            NPC
                        </span>
                    </h2>
                </div>
            }
        >
            <Head title={`NPC: ${npc.name}`} />
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Dados</h3>
                        <NpcForm
                            initial={initial}
                            submit={(form) => form.post(route('npcs.update', npc.id), { forceFormData: true })}
                            submitLabel="Salvar"
                            portraitUrl={npc.portrait_path ? asset(npc.portrait_path) : undefined}
                            onPortraitDelete={npc.portrait_path ? () => router.delete(
                                route('npcs.portrait.destroy', npc.id),
                                { preserveScroll: true },
                            ) : undefined}
                            campaignId={campaign.id}
                        />
                    </section>

                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Expressões / sprites</h3>

                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {(npc.expressions ?? []).length === 0 && (
                                <p className="col-span-full text-sm text-gray-500">
                                    Nenhuma expressão cadastrada ainda.
                                </p>
                            )}
                            {(npc.expressions ?? []).map((e) => (
                                <div key={e.id} className={`group rounded border p-2 text-center ${e.is_default ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}>
                                    <div className="relative">
                                        <img
                                            src={asset(e.sprite_path)}
                                            alt={e.label}
                                            className="mx-auto h-32 w-32 rounded object-cover"
                                        />
                                        <DeleteImageButton
                                            onConfirm={() => router.delete(
                                                route('npcs.expressions.destroy', [npc.id, e.id]),
                                                { preserveScroll: true },
                                            )}
                                            message={`Remover expressão "${e.label}"?`}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs font-medium">{e.label}</div>
                                    <label className="mt-1 flex items-center justify-center gap-1 text-[11px] text-gray-700">
                                        <input
                                            type="radio"
                                            name="default_expression"
                                            checked={!!e.is_default}
                                            onChange={() => {
                                                if (e.is_default) return;
                                                router.patch(
                                                    route('npcs.expressions.default', [npc.id, e.id]),
                                                    {},
                                                    { preserveScroll: true },
                                                );
                                            }}
                                        />
                                        padrão
                                    </label>
                                </div>
                            ))}
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                expr.post(route('npcs.expressions.store', npc.id), {
                                    forceFormData: true,
                                    onSuccess: () => {
                                        expr.reset(
                                            'sprite',
                                            'sprite_prompt',
                                            'sprite_refs',
                                            'sprite_existing_refs',
                                            'sprite_existing_path',
                                            'sprite_source',
                                        );
                                    },
                                });
                            }}
                            className="space-y-4 border-t pt-4"
                            encType="multipart/form-data"
                        >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="label" value="Rótulo" />
                                    <select
                                        id="label"
                                        value={expr.data.label}
                                        onChange={(e) => expr.setData('label', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {expressionLabels.map((l) => <option key={l}>{l}</option>)}
                                    </select>
                                    <InputError message={expr.errors.label} className="mt-1" />
                                </div>
                            </div>
                            <ImageSourcePicker
                                field="sprite"
                                label="Sprite (PNG transparente recomendado)"
                                data={expr.data as unknown as Record<string, unknown>}
                                setData={(k, v) => expr.setData(k as never, v as never)}
                                errors={expr.errors as Record<string, string | undefined>}
                                aiDisabled={!features.ai_images}
                                existingRefs={existingRefs}
                                campaignId={campaign.id}
                                galleryCategory="npcs"
                            />
                            <PrimaryButton disabled={expr.processing}>+ Adicionar expressão</PrimaryButton>
                        </form>
                    </section>
                </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
