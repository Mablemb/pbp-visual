import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    campaign: { id: number; name: string };
    statuses: string[];
}

export default function QuestsCreate({ campaign, statuses }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', description: '', status: 'active',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Nova missão</h2>
                </div>
            }
        >
            <Head title="Nova missão" />
            <div className="py-8">
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <form onSubmit={(e) => { e.preventDefault(); post(route('campaigns.quests.store', campaign.id)); }} className="space-y-4">
                        <Common data={data} setData={setData} errors={errors} statuses={statuses} />
                        <PrimaryButton disabled={processing}>Criar</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export function Common({ data, setData, errors, statuses }: {
    data: { title: string; description: string; status: string };
    setData: (k: any, v: any) => void;
    errors: Partial<Record<string, string>>;
    statuses: string[];
}) {
    return (
        <>
            <div>
                <InputLabel htmlFor="title" value="Título" />
                <TextInput id="title" className="mt-1 block w-full" value={data.title}
                    onChange={(e) => setData('title', e.target.value)} required />
                <InputError message={errors.title} className="mt-1" />
            </div>
            <div>
                <InputLabel htmlFor="description" value="Descrição" />
                <textarea id="description" rows={5} value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <InputError message={errors.description} className="mt-1" />
            </div>
            <div>
                <InputLabel htmlFor="status" value="Status" />
                <select id="status" value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <InputError message={errors.status} className="mt-1" />
            </div>
        </>
    );
}
