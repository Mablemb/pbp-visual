import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MarkdownEditor from '@/Components/MarkdownEditor';
import ImageSourcePicker from '@/Components/ImageSourcePicker';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Props { campaign: { id: number; name: string } }

export interface LocationFormData {
    name: string;
    description: string;
    background_source: '' | 'upload' | 'ai' | 'existing';
    background: File | null;
    background_prompt: string;
    background_refs: File[];
    background_existing_refs: string[];
    background_existing_path: string;
}

export const emptyLocationForm: LocationFormData = {
    name: '',
    description: '',
    background_source: '',
    background: null,
    background_prompt: '',
    background_refs: [],
    background_existing_refs: [],
    background_existing_path: '',
};

export default function LocationsCreate({ campaign }: Props) {
    const form = useForm<LocationFormData>(emptyLocationForm);

    return (
        <AuthenticatedLayout header={<Header campaign={campaign} title="Novo cenário" />}>
            <Head title="Novo cenário" />
            <FormShell>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(route('campaigns.locations.store', campaign.id), {
                            forceFormData: true,
                        });
                    }}
                    className="space-y-4"
                    encType="multipart/form-data"
                >
                    <LocationFields form={form} campaignId={campaign.id} />
                    <PrimaryButton disabled={form.processing}>Criar</PrimaryButton>
                </form>
            </FormShell>
        </AuthenticatedLayout>
    );
}

export function LocationFields({
    form,
    currentBgUrl,
    onBgDelete,
    campaignId,
}: {
    form: ReturnType<typeof useForm<LocationFormData>>;
    currentBgUrl?: string | null;
    onBgDelete?: () => void;
    campaignId: number;
}) {
    const { data, setData, errors, progress } = form;
    const { features } = usePage<PageProps>().props;

    return (
        <>
            <div>
                <InputLabel htmlFor="name" value="Nome" />
                <TextInput
                    id="name"
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} className="mt-1" />
            </div>
            <div>
                <InputLabel htmlFor="description" value="Descrição" />
                <div className="mt-1">
                    <MarkdownEditor
                        id="description"
                        value={data.description}
                        onChange={(v) => setData('description', v)}
                        placeholder="Descreva o cenário..."
                    />
                </div>
                <InputError message={errors.description} className="mt-1" />
            </div>
            <ImageSourcePicker
                field="background"
                label="Background"
                data={data as unknown as Record<string, unknown>}
                setData={(k, v) => setData(k as keyof LocationFormData, v as never)}
                errors={errors as Record<string, string | undefined>}
                aiDisabled={!features.ai_images}
                currentPreview={currentBgUrl ?? undefined}
                onDelete={onBgDelete}
                campaignId={campaignId}
                galleryCategory="locations"
            />
            {progress && (
                <progress value={progress.percentage} max={100} className="w-full" />
            )}
        </>
    );
}

function Header({ campaign, title }: { campaign: { id: number; name: string }; title: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-800">
            <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                ← {campaign.name}
            </Link>
            <h2 className="text-xl font-semibold">/ {title}</h2>
        </div>
    );
}

function FormShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="py-8">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
}
