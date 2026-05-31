import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Location, asset } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { LocationFields, LocationFormData } from './Create';

interface Props {
    campaign: { id: number; name: string };
    location: Location;
}

export default function LocationsEdit({ campaign, location }: Props) {
    // Inertia doesn't support PUT with multipart; use POST + _method spoofing.
    const form = useForm<LocationFormData & { _method: string }>({
        _method: 'put',
        name: location.name,
        description: location.description ?? '',
        background_source: '',
        background: null,
        background_prompt: '',
        background_refs: [],
        background_existing_refs: [],
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Editar cenário</h2>
                </div>
            }
        >
            <Head title="Editar cenário" />
            <div className="py-8">
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm sm:px-6 lg:px-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.post(route('locations.update', location.id), { forceFormData: true });
                        }}
                        className="space-y-4"
                        encType="multipart/form-data"
                    >
                        <LocationFields
                            form={form as never}
                            currentBgUrl={asset(location.background_path) ?? null}
                        />
                        <PrimaryButton disabled={form.processing}>Salvar</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
