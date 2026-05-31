import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props { campaign: { id: number; name: string } }

export default function NpcsCreate({ campaign }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', role: '', description: '',
    });

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
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <form onSubmit={(e) => { e.preventDefault(); post(route('campaigns.npcs.store', campaign.id)); }} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nome" />
                            <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="role" value="Papel (ex: Taverneiro)" />
                            <TextInput id="role" className="mt-1 block w-full" value={data.role} onChange={(e) => setData('role', e.target.value)} />
                            <InputError message={errors.role} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="Descrição" />
                            <textarea id="description" rows={4} value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                        <p className="text-xs text-gray-500">
                            Você poderá adicionar as expressões (neutral, feliz, raivoso...) na próxima tela.
                        </p>
                        <PrimaryButton disabled={processing}>Criar e adicionar expressões →</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
