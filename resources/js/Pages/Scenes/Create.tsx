import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AutoTextarea from '@/Components/AutoTextarea';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    campaign: { id: number; name: string };
    locations: { id: number; name: string }[];
}

export default function ScenesCreate({ campaign, locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        summary: string;
        location_id: string;
    }>({
        title: '',
        summary: '',
        location_id: '',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Nova cena</h2>
                </div>
            }
        >
            <Head title="Nova cena" />
            <div className="py-8">
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post(route('campaigns.scenes.store', campaign.id));
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.location_id}
                                onChange={(e) => setData('location_id', e.target.value)}
                            >
                                <option value="">— sem cenário —</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.location_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="summary" value="Resumo (opcional, só DM vê)" />
                            <AutoTextarea
                                id="summary"
                                className="mt-1 block w-full"
                                rows={3}
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                            />
                            <InputError message={errors.summary} className="mt-2" />
                        </div>
                        <PrimaryButton disabled={processing}>Criar e editar linhas</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
