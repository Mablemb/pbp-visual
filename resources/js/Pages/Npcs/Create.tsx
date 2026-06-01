import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageSourcePicker from '@/Components/ImageSourcePicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export interface NpcFormData {
    _method?: string;
    name: string; role: string; description: string;
    race: string; class: string;
    level: number; hp_max: number; hp_current: number;
    strength: number; dexterity: number; constitution: number;
    intelligence: number; wisdom: number; charisma: number;
    bio: string;
    portrait_source: '' | 'upload' | 'ai';
    portrait: File | null;
    portrait_prompt: string;
    portrait_refs: File[];
    portrait_existing_refs: string[];
}

const ABILITY_KEYS: (keyof NpcFormData)[] = [
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
];

export function NpcForm({
    initial,
    submit,
    portraitUrl,
    submitLabel,
}: {
    initial: NpcFormData;
    submit: (form: ReturnType<typeof useForm<NpcFormData>>) => void;
    portraitUrl?: string;
    submitLabel: string;
}) {
    const form = useForm<NpcFormData>(initial);
    const { data, setData, errors, processing, progress } = form;
    const { features } = usePage<PageProps>().props;

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); submit(form); }}
            className="space-y-4"
            encType="multipart/form-data"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nome" name="name" value={data.name}
                    onChange={(v) => setData('name', v)} error={errors.name} required />
                <Field label="Papel (ex: Taverneiro)" name="role" value={data.role}
                    onChange={(v) => setData('role', v)} error={errors.role} />
                <Field label="Raça" name="race" value={data.race}
                    onChange={(v) => setData('race', v)} error={errors.race} />
                <Field label="Classe" name="class" value={data.class}
                    onChange={(v) => setData('class', v)} error={errors.class} />
                <Field label="Nível" name="level" type="number"
                    value={String(data.level)} onChange={(v) => setData('level', Number(v))} error={errors.level} />
                <div />
                <Field label="HP máx" name="hp_max" type="number"
                    value={String(data.hp_max)} onChange={(v) => setData('hp_max', Number(v))} error={errors.hp_max} />
                <Field label="HP atual" name="hp_current" type="number"
                    value={String(data.hp_current)} onChange={(v) => setData('hp_current', Number(v))} error={errors.hp_current} />
            </div>

            <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Atributos</h4>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {ABILITY_KEYS.map((k) => (
                        <Field
                            key={k}
                            label={(k as string).slice(0, 3).toUpperCase()}
                            name={k as string}
                            type="number"
                            value={String(data[k])}
                            onChange={(v) => setData(k, Number(v) as never)}
                            error={(errors as Record<string, string | undefined>)[k as string]}
                        />
                    ))}
                </div>
            </div>

            <div>
                <InputLabel htmlFor="description" value="Descrição curta" />
                <textarea
                    id="description" rows={2}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <InputError message={errors.description} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor="bio" value="Biografia / notas" />
                <textarea
                    id="bio" rows={4}
                    value={data.bio}
                    onChange={(e) => setData('bio', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <InputError message={errors.bio} className="mt-1" />
            </div>

            <ImageSourcePicker
                field="portrait"
                label="Retrato"
                data={data as unknown as Record<string, unknown>}
                setData={(k, v) => setData(k as keyof NpcFormData, v as never)}
                errors={errors as Record<string, string | undefined>}
                aiDisabled={!features.ai_images}
                currentPreview={portraitUrl ?? null}
            />
            {progress && <progress value={progress.percentage} max={100} className="w-full" />}

            <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
        </form>
    );
}

function Field({
    label, name, value, onChange, error, type = 'text', required,
}: {
    label: string; name: string; value: string;
    onChange: (v: string) => void; error?: string; type?: string; required?: boolean;
}) {
    return (
        <div>
            <InputLabel htmlFor={name} value={label} />
            <TextInput id={name} type={type} value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full" required={required} />
            <InputError message={error} className="mt-1" />
        </div>
    );
}

interface CreateProps { campaign: { id: number; name: string } }

export default function NpcsCreate({ campaign }: CreateProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Novo NPC</h2>
                </div>
            }
        >
            <Head title="Novo NPC" />
            <div className="py-8">
                <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <p className="mb-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        NPC
                    </p>
                    <NpcForm
                        initial={{
                            name: '', role: '', description: '',
                            race: '', class: '', level: 1,
                            hp_max: 10, hp_current: 10,
                            strength: 10, dexterity: 10, constitution: 10,
                            intelligence: 10, wisdom: 10, charisma: 10,
                            bio: '',
                            portrait_source: '', portrait: null,
                            portrait_prompt: '', portrait_refs: [], portrait_existing_refs: [],
                        }}
                        submit={(form) => form.post(route('campaigns.npcs.store', campaign.id), { forceFormData: true })}
                        submitLabel="Criar e adicionar expressões →"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
