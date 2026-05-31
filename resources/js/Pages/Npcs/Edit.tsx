import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageSourcePicker from '@/Components/ImageSourcePicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Npc, asset } from '@/types/models';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

interface Props {
    campaign: { id: number; name: string };
    npc: Npc;
    expressionLabels: string[];
}

export default function NpcsEdit({ campaign, npc, expressionLabels }: Props) {
    const { features } = usePage<PageProps>().props;

    const meta = useForm({
        name: npc.name,
        role: npc.role ?? '',
        description: npc.description ?? '',
    });

    const expr = useForm<{
        label: string;
        sprite_source: '' | 'upload' | 'ai';
        sprite: File | null;
        sprite_prompt: string;
        sprite_refs: File[];
        sprite_existing_refs: string[];
    }>({
        label: expressionLabels[0] ?? 'neutral',
        sprite_source: '',
        sprite: null,
        sprite_prompt: '',
        sprite_refs: [],
        sprite_existing_refs: [],
    });

    const existingRefs = (npc.expressions ?? []).map((e) => ({
        label: e.label,
        path: e.sprite_path,
    }));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ NPC: {npc.name}</h2>
                </div>
            }
        >
            <Head title={`NPC: ${npc.name}`} />
            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    {/* Metadata */}
                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Dados</h3>
                        <form
                            onSubmit={(e) => { e.preventDefault(); meta.put(route('npcs.update', npc.id)); }}
                            className="space-y-4"
                        >
                            <div>
                                <InputLabel htmlFor="name" value="Nome" />
                                <TextInput id="name" className="mt-1 block w-full"
                                    value={meta.data.name}
                                    onChange={(e) => meta.setData('name', e.target.value)} required />
                                <InputError message={meta.errors.name} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="role" value="Papel" />
                                <TextInput id="role" className="mt-1 block w-full"
                                    value={meta.data.role}
                                    onChange={(e) => meta.setData('role', e.target.value)} />
                            </div>
                            <div>
                                <InputLabel htmlFor="description" value="Descrição" />
                                <textarea id="description" rows={3} value={meta.data.description}
                                    onChange={(e) => meta.setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <PrimaryButton disabled={meta.processing}>Salvar</PrimaryButton>
                        </form>
                    </section>

                    {/* Expressions */}
                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Expressões / sprites</h3>

                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {(npc.expressions ?? []).length === 0 && (
                                <p className="col-span-full text-sm text-gray-500">
                                    Nenhuma expressão cadastrada ainda.
                                </p>
                            )}
                            {(npc.expressions ?? []).map((e) => (
                                <div key={e.id} className={`rounded border p-2 text-center ${e.is_default ? 'border-amber-400 ring-2 ring-amber-200' : ''}`}>
                                    <img
                                        src={asset(e.sprite_path)}
                                        alt={e.label}
                                        className="mx-auto h-32 w-32 rounded object-cover"
                                    />
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
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Remover expressão "${e.label}"?`)) {
                                                router.delete(route('npcs.expressions.destroy', [npc.id, e.id]), { preserveScroll: true });
                                            }
                                        }}
                                        className="mt-1 text-[11px] text-red-600 hover:underline"
                                    >
                                        remover
                                    </button>
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
                            />
                            <PrimaryButton disabled={expr.processing}>+ Adicionar expressão</PrimaryButton>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
