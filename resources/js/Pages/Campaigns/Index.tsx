import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CollapsibleText from '@/Components/CollapsibleText';
import { CampaignSummary } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    owned: CampaignSummary[];
    playing: CampaignSummary[];
}

export default function CampaignsIndex({ owned, playing }: Props) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Campanhas</h2>}
        >
            <Head title="Campanhas" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-8 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Suas campanhas (DM)</h3>
                            <Link
                                href={route('campaigns.create')}
                                className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                + Nova campanha
                            </Link>
                        </div>
                        <CampaignList items={owned} emptyMsg="Você ainda não criou nenhuma campanha." />
                    </section>

                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Campanhas em que você joga</h3>
                        <CampaignList items={playing} emptyMsg="Você ainda não foi convidado para nenhuma campanha." />
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function CampaignList({ items, emptyMsg }: { items: CampaignSummary[]; emptyMsg: string }) {
    const [expandedCampaignIds, setExpandedCampaignIds] = useState<number[]>([]);

    function toggleCampaign(id: number) {
        setExpandedCampaignIds((current) =>
            current.includes(id)
                ? current.filter((campaignId) => campaignId !== id)
                : [...current, id],
        );
    }

    if (items.length === 0) {
        return <p className="text-sm text-gray-500">{emptyMsg}</p>;
    }
    return (
        <ul className="divide-y">
            {items.map((c) => (
                <li key={c.id} className="py-3">
                    <div className="flex items-start justify-between gap-4 rounded-md px-2 py-2 hover:bg-gray-50">
                        <div className="min-w-0 flex-1">
                            <Link
                                href={route('campaigns.show', c.id)}
                                className="block font-medium text-indigo-700 hover:underline"
                            >
                                {c.name}
                            </Link>
                            {c.synopsis && (
                                <div className="mt-1">
                                    <CollapsibleText
                                        text={c.synopsis}
                                        expanded={expandedCampaignIds.includes(c.id)}
                                        onToggle={() => toggleCampaign(c.id)}
                                    />
                                </div>
                            )}
                        </div>
                        <Link
                            href={route('campaigns.show', c.id)}
                            className="shrink-0 text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Abrir
                        </Link>
                    </div>
                </li>
            ))}
        </ul>
    );
}
