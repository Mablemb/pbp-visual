import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AutoTextarea from '@/Components/AutoTextarea';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { PlayerAction } from '@/types/models';

interface Props {
    campaign: { id: number; name: string };
    actions: PlayerAction[];
}

export default function PlayerActionsIndex({ campaign, actions }: Props) {
    const pending = actions.filter((a) => a.status === 'pending');
    const resolved = actions.filter((a) => a.status === 'resolved');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-800">
                    <Link href={route('campaigns.show', campaign.id)} className="text-sm text-indigo-600 hover:underline">
                        ← {campaign.name}
                    </Link>
                    <h2 className="text-xl font-semibold">/ Caixa de ações</h2>
                </div>
            }
        >
            <Head title="Caixa de ações" />
            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Section title={`Pendentes (${pending.length})`} actions={pending} highlight />
                    <Section title={`Resolvidas (${resolved.length})`} actions={resolved} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Section({
    title,
    actions,
    highlight = false,
}: {
    title: string;
    actions: PlayerAction[];
    highlight?: boolean;
}) {
    return (
        <section className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className={'mb-4 text-lg font-semibold ' + (highlight ? 'text-yellow-700' : '')}>
                {title}
            </h3>
            {actions.length === 0 ? (
                <p className="text-sm text-gray-500">Nada por aqui.</p>
            ) : (
                <ul className="space-y-3">
                    {actions.map((a) => (
                        <ActionRow key={a.id} action={a} />
                    ))}
                </ul>
            )}
        </section>
    );
}

function ActionRow({ action }: { action: PlayerAction }) {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing } = useForm({
        status: action.status,
        dm_notes: action.dm_notes ?? '',
    });

    return (
        <li className="rounded border border-gray-200 p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>
                    {action.scene && (
                        <Link
                            href={route('scenes.show', action.scene.id)}
                            className="font-semibold text-indigo-600 hover:underline"
                        >
                            {action.scene.title}
                        </Link>
                    )}
                    {' · '}
                    <span className="font-semibold text-gray-700">{action.user?.name}</span>
                    {action.character && <> como <em>{action.character.name}</em></>}
                </span>
                <span
                    className={
                        'rounded px-2 py-0.5 ' +
                        (action.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-yellow-100 text-yellow-700')
                    }
                >
                    {action.status}
                </span>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-800">{action.body}</div>
            {action.dm_notes && !open && (
                <div className="mt-2 rounded bg-indigo-50 p-2 text-xs text-indigo-900">
                    <strong>Nota do DM:</strong> {action.dm_notes}
                </div>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="text-indigo-600 hover:underline"
                >
                    {open ? 'fechar' : 'responder / resolver'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (!confirm('Excluir esta ação?')) return;
                        router.delete(route('actions.destroy', action.id), { preserveScroll: true });
                    }}
                    className="text-red-600 hover:underline"
                >
                    excluir
                </button>
            </div>

            {open && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        put(route('actions.update', action.id), {
                            preserveScroll: true,
                            onSuccess: () => setOpen(false),
                        });
                    }}
                    className="mt-3 space-y-2"
                >
                    <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                checked={data.status === 'pending'}
                                onChange={() => setData('status', 'pending')}
                            />
                            Pendente
                        </label>
                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                checked={data.status === 'resolved'}
                                onChange={() => setData('status', 'resolved')}
                            />
                            Resolvida
                        </label>
                    </div>
                    <AutoTextarea
                        value={data.dm_notes}
                        onChange={(e) => setData('dm_notes', e.target.value)}
                        rows={3}
                        placeholder="Notas do DM (ex.: rolou Furtividade 17, conseguiu se esgueirar...)"
                        className="block w-full text-sm"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Salvar
                    </button>
                </form>
            )}
        </li>
    );
}
