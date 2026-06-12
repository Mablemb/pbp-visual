import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
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
            {items.map((c) => {
                const isExpanded = expandedCampaignIds.includes(c.id);
                return (
                    <li key={c.id} className="py-2">
                        <div className="rounded-md px-2 py-2 hover:bg-gray-50">
                            <div className="flex items-center justify-between gap-3">
                                <Link
                                    href={route('campaigns.show', c.id)}
                                    className="min-w-0 flex-1 font-medium text-indigo-700 hover:underline"
                                >
                                    {c.name}
                                </Link>
                                <div className="flex shrink-0 items-center gap-2">
                                    {c.synopsis && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCampaign(c.id)}
                                            aria-expanded={isExpanded}
                                            aria-label={isExpanded ? 'Recolher sinopse' : 'Expandir sinopse'}
                                            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                        >
                                            <svg
                                                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                    <Link
                                        href={route('campaigns.show', c.id)}
                                        className="text-sm font-medium text-indigo-600 hover:underline"
                                    >
                                        Abrir
                                    </Link>
                                </div>
                            </div>
                            {c.synopsis && (
                                <p className={`mt-1 text-sm text-gray-600 ${isExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}`}>
                                    {c.synopsis}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
