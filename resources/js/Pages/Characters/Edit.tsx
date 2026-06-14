import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteImageButton from '@/Components/DeleteImageButton';
import ImageSourcePicker from '@/Components/ImageSourcePicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Character, asset } from '@/types/models';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CharacterForm } from './Create';

interface Props {
    campaign: { id: number; name: string };
    character: Character;
    expressionLabels: string[];
}

export default function CharactersEdit({ campaign, character, expressionLabels }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ {character.name}</h2>
                </div>
            }
        >
            <Head title={character.name} />
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <CharacterForm
                            initial={{
                                _method: 'put',
                                name: character.name,
                                race: character.race ?? '',
                                class: character.class ?? '',
                                level: character.level,
                                hp_max: character.hp_max,
                                hp_current: character.hp_current,
                                strength: character.strength,
                                dexterity: character.dexterity,
                                constitution: character.constitution,
                                intelligence: character.intelligence,
                                wisdom: character.wisdom,
                                charisma: character.charisma,
                                bio: character.bio ?? '',
                                portrait_source: '',
                                portrait: null,
                                portrait_prompt: '',
                                portrait_refs: [],
                                portrait_existing_refs: [],
                                portrait_existing_path: '',
                            }}
                            portraitUrl={asset(character.portrait_path)}
                            submit={(form) => form.post(route('characters.update', character.id), { forceFormData: true })}
                            submitLabel="Salvar"
                            onPortraitDelete={character.portrait_path ? () => router.delete(
                                route('characters.portrait.destroy', character.id),
                                { preserveScroll: true },
                            ) : undefined}
                            campaignId={campaign.id}
                        />
                    </section>

                    <ExpressionsPanel character={character} expressionLabels={expressionLabels} campaignId={campaign.id} />
                </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ExpressionsPanel({ character, expressionLabels, campaignId }: { character: Character; expressionLabels: string[]; campaignId: number }) {
    const { features } = usePage<PageProps>().props;

    const form = useForm<{
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

    const existingRefs = (character.expressions ?? []).map((e) => ({
        label: e.label,
        path: e.sprite_path,
    }));
    if (character.portrait_path) {
        existingRefs.unshift({ label: 'retrato', path: character.portrait_path });
    }

    return (
        <section className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Expressões / sprites</h3>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(character.expressions ?? []).length === 0 && (
                    <p className="col-span-full text-sm text-gray-500">
                        Nenhuma expressão cadastrada ainda.
                    </p>
                )}
                {(character.expressions ?? []).map((e) => (
                    <div
                        key={e.id}
                        className={`group rounded border p-2 text-center ${
                            e.is_default ? 'border-amber-400 ring-2 ring-amber-200' : ''
                        }`}
                    >
                        <div className="relative">
                            <img
                                src={asset(e.sprite_path) ?? undefined}
                                alt={e.label}
                                className="mx-auto h-32 w-32 rounded object-cover"
                            />
                            <DeleteImageButton
                                onConfirm={() => router.delete(
                                    route('characters.expressions.destroy', [character.id, e.id]),
                                    { preserveScroll: true },
                                )}
                                message={`Remover expressão "${e.label}"?`}
                            />
                        </div>
                        <div className="mt-1 text-xs font-medium">{e.label}</div>
                        <label className="mt-1 flex items-center justify-center gap-1 text-[11px] text-gray-700">
                            <input
                                type="radio"
                                name="default_char_expression"
                                checked={!!e.is_default}
                                onChange={() => {
                                    if (e.is_default) return;
                                    router.patch(
                                        route('characters.expressions.default', [character.id, e.id]),
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
                    form.post(route('characters.expressions.store', character.id), {
                        forceFormData: true,
                        onSuccess: () =>
                            form.reset(
                                'sprite',
                                'sprite_prompt',
                                'sprite_refs',
                                'sprite_existing_refs',
                                'sprite_existing_path',
                                'sprite_source',
                            ),
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
                            value={form.data.label}
                            onChange={(e) => form.setData('label', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            {expressionLabels.map((l) => <option key={l}>{l}</option>)}
                        </select>
                        <InputError message={form.errors.label} className="mt-1" />
                    </div>
                </div>
                <ImageSourcePicker
                    field="sprite"
                    label="Sprite (PNG transparente recomendado)"
                    data={form.data as unknown as Record<string, unknown>}
                    setData={(k, v) => form.setData(k as never, v as never)}
                    errors={form.errors as Record<string, string | undefined>}
                    aiDisabled={!features.ai_images}
                    existingRefs={existingRefs}
                    campaignId={campaignId}
                    galleryCategory="players"
                />
                <PrimaryButton disabled={form.processing}>+ Adicionar expressão</PrimaryButton>
            </form>
        </section>
    );
}
