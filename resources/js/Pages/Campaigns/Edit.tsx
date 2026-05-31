import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Campaign } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';

interface Props { campaign: Campaign }

export default function CampaignsEdit({ campaign }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: campaign.name,
        synopsis: campaign.synopsis ?? '',
    });

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Editar campanha</h2>}>
            <Head title="Editar campanha" />
            <div className="py-8">
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <form onSubmit={(e) => { e.preventDefault(); put(route('campaigns.update', campaign.id)); }} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nome" />
                            <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="synopsis" value="Sinopse" />
                            <textarea id="synopsis" rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={data.synopsis} onChange={(e) => setData('synopsis', e.target.value)} />
                            <InputError message={errors.synopsis} className="mt-1" />
                        </div>
                        <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
