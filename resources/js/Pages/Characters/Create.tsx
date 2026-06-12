import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MarkdownEditor from '@/Components/MarkdownEditor';
import ImageSourcePicker from '@/Components/ImageSourcePicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Character, asset } from '@/types/models';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export interface CharFormData {
    _method?: string;
    name: string; race: string; class: string;
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

const ABILITY_KEYS: (keyof CharFormData)[] = [
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
];

export function CharacterForm({
    initial,
    submit,
    portraitUrl,
    submitLabel,
    onPortraitDelete,
}: {
    initial: CharFormData;
    submit: (form: ReturnType<typeof useForm<CharFormData>>) => void;
    portraitUrl?: string;
    submitLabel: string;
    onPortraitDelete?: () => void;
}) {
    const form = useForm<CharFormData>(initial);
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
                <Field label="Nível" name="level" type="number"
                    value={String(data.level)} onChange={(v) => setData('level', Number(v))} error={errors.level} />
                <Field label="Raça" name="race" value={data.race}
                    onChange={(v) => setData('race', v)} error={errors.race} />
                <Field label="Classe" name="class" value={data.class}
                    onChange={(v) => setData('class', v)} error={errors.class} />
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
                            label={k.slice(0, 3).toUpperCase()}
                            name={k}
                            type="number"
                            value={String(data[k])}
                            onChange={(v) => setData(k, Number(v) as any)}
                            error={(errors as any)[k]}
                        />
                    ))}
                </div>
            </div>

            <div>
                <InputLabel htmlFor="bio" value="Biografia" />
                <div className="mt-1">
                    <MarkdownEditor
                        id="bio"
                        value={data.bio}
                        onChange={(v) => setData('bio', v)}
                        placeholder="Escreva a biografia do personagem..."
                    />
                </div>
                <InputError message={errors.bio} className="mt-1" />
            </div>

            <ImageSourcePicker
                field="portrait"
                label="Retrato"
                data={data as unknown as Record<string, unknown>}
                setData={(k, v) => setData(k as keyof CharFormData, v as never)}
                errors={errors as Record<string, string | undefined>}
                aiDisabled={!features.ai_images}
                currentPreview={portraitUrl ?? null}
                onDelete={onPortraitDelete}
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

export default function CharactersCreate({ campaign }: CreateProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Novo personagem</h2>
                </div>
            }
        >
            <Head title="Novo personagem" />
            <div className="py-8">
                <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <CharacterForm
                        initial={{
                            name: '', race: '', class: '', level: 1,
                            hp_max: 10, hp_current: 10,
                            strength: 10, dexterity: 10, constitution: 10,
                            intelligence: 10, wisdom: 10, charisma: 10,
                            bio: '',
                            portrait_source: '', portrait: null,
                            portrait_prompt: '', portrait_refs: [], portrait_existing_refs: [],
                        }}
                        submit={(form) => form.post(route('campaigns.characters.store', campaign.id), { forceFormData: true })}
                        submitLabel="Criar"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
