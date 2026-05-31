import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Quest } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { Common } from './Create';

interface Props {
    campaign: { id: number; name: string };
    quest: Quest;
    statuses: string[];
}

export default function QuestsEdit({ campaign, quest, statuses }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: quest.title,
        description: quest.description ?? '',
        status: quest.status,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Editar missão</h2>
                </div>
            }
        >
            <Head title="Editar missão" />
            <div className="py-8">
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <form onSubmit={(e) => { e.preventDefault(); put(route('quests.update', quest.id)); }} className="space-y-4">
                        <Common data={data} setData={setData} errors={errors} statuses={statuses} />
                        <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
