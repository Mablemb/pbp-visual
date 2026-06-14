import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';

/**
 * Mobile-first popup to browse and reuse a campaign's already-uploaded images.
 *
 * Images are grouped into folders by category and can be filtered by name. What
 * the endpoint returns already enforces visibility (the DM sees every image in
 * the campaign; a player only sees their own uploads), so this component just
 * renders whatever it gets.
 */
export interface GalleryImage {
    id: number;
    category: 'npcs' | 'players' | 'locations';
    path: string;
    label: string | null;
    filename: string;
    url: string;
}

const FOLDER_LABELS: Record<GalleryImage['category'], string> = {
    npcs: 'NPCs',
    players: 'Jogadores',
    locations: 'Cenários',
};

const FOLDER_ORDER: GalleryImage['category'][] = ['npcs', 'players', 'locations'];

interface Props {
    show: boolean;
    campaignId: number;
    /** Folder to open first (the picker's own category). */
    defaultCategory?: GalleryImage['category'];
    selectedPath?: string;
    onSelect: (image: GalleryImage) => void;
    onClose: () => void;
}

export default function ImageGalleryModal({
    show,
    campaignId,
    defaultCategory,
    selectedPath,
    onSelect,
    onClose,
}: Props) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [folder, setFolder] = useState<GalleryImage['category'] | 'all'>(
        defaultCategory ?? 'all',
    );
    const [search, setSearch] = useState('');

    // Load once the modal is first opened.
    useEffect(() => {
        if (!show || loaded || loading) return;
        setLoading(true);
        fetch(`/campaigns/${campaignId}/images`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : []))
            .then((rows: GalleryImage[]) => setImages(rows))
            .catch(() => setImages([]))
            .finally(() => {
                setLoading(false);
                setLoaded(true);
            });
    }, [show, loaded, loading, campaignId]);

    // Reset the chosen folder to the picker's category each time it opens.
    useEffect(() => {
        if (show) setFolder(defaultCategory ?? 'all');
    }, [show, defaultCategory]);

    const folders = useMemo(() => {
        const present = new Set(images.map((i) => i.category));
        return FOLDER_ORDER.filter((c) => present.has(c));
    }, [images]);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        return images.filter((img) => {
            if (folder !== 'all' && img.category !== folder) return false;
            if (!term) return true;
            return (
                img.filename.toLowerCase().includes(term) ||
                (img.label ?? '').toLowerCase().includes(term)
            );
        });
    }, [images, folder, search]);

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-2 py-4 sm:px-4 sm:py-6"
                onClose={onClose}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel className="relative flex max-h-[90vh] w-full max-w-3xl transform flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3">
                            <h4 className="text-lg font-semibold text-gray-900">Galeria</h4>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Fechar"
                                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search + folders */}
                        <div className="space-y-3 border-b border-gray-100 px-4 py-3">
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar pelo nome do arquivo…"
                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {folders.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    <FolderTab active={folder === 'all'} onClick={() => setFolder('all')}>
                                        Todas
                                    </FolderTab>
                                    {folders.map((c) => (
                                        <FolderTab key={c} active={folder === c} onClick={() => setFolder(c)}>
                                            {FOLDER_LABELS[c]}
                                        </FolderTab>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="min-h-[8rem] overflow-y-auto px-4 py-4">
                            {loading && <p className="text-sm text-gray-500">Carregando galeria…</p>}
                            {!loading && visible.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    {images.length === 0
                                        ? 'Nenhuma imagem disponível ainda.'
                                        : 'Nenhuma imagem corresponde à busca.'}
                                </p>
                            )}
                            {visible.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {visible.map((img) => {
                                        const selected = selectedPath === img.path;
                                        return (
                                            <button
                                                type="button"
                                                key={img.id}
                                                onClick={() => onSelect(img)}
                                                title={img.filename}
                                                className={
                                                    'group flex flex-col rounded border-2 p-1 text-left transition ' +
                                                    (selected
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-transparent hover:border-gray-300')
                                                }
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.label ?? img.filename}
                                                    loading="lazy"
                                                    className="aspect-square w-full rounded object-cover"
                                                />
                                                <span className="mt-1 block truncate text-[11px] text-gray-600">
                                                    {img.label || img.filename}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

function FolderTab({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ' +
                (active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }
        >
            {children}
        </button>
    );
}
