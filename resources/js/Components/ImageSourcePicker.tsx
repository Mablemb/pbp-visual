import { useState } from 'react';
import AutoTextarea from '@/Components/AutoTextarea';
import DeleteImageButton from '@/Components/DeleteImageButton';
import ImageGalleryModal from '@/Components/ImageGalleryModal';
import { asset } from '@/types/models';

/**
 * Polymorphic image picker: lets the user upload a file, ask the AI to generate
 * one (prompt + optional references), or reuse an already-uploaded image from
 * the campaign gallery (opens ImageGalleryModal). Writes form-data fields with a
 * configurable prefix:
 *
 *   <field>_source       'upload' | 'ai' | 'existing'
 *   <field>              File          (upload mode)
 *   <field>_prompt       string        (ai mode)
 *   <field>_refs         File[]        (ai mode, optional)
 *   <field>_existing_refs string[]     (ai mode, optional, public-disk paths)
 *   <field>_existing_path string       (existing mode — chosen gallery path)
 *
 * Must be used inside a <form> using Inertia's useForm({ ..., forceFormData }).
 */
export interface ExistingRef {
    label: string;
    path: string;
}

interface Props {
    field: string;
    label: string;
    data: Record<string, unknown>;
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string | undefined>;
    /** Disable the AI tab (driver=upload on the server, etc.). */
    aiDisabled?: boolean;
    /** Existing images the DM may reuse as AI references. */
    existingRefs?: ExistingRef[];
    /** Optional preview of the current persisted image. */
    currentPreview?: string | null;
    /** Called when the user confirms deleting the current image. */
    onDelete?: () => void;
    /** Campaign + category enabling the "Galeria" reuse tab. */
    campaignId?: number;
    galleryCategory?: 'npcs' | 'players' | 'locations';
}

export default function ImageSourcePicker({
    field,
    label,
    data,
    setData,
    errors,
    aiDisabled = false,
    existingRefs = [],
    currentPreview,
    onDelete,
    campaignId,
    galleryCategory,
}: Props) {
    const sourceKey = `${field}_source`;
    const promptKey = `${field}_prompt`;
    const refsKey = `${field}_refs`;
    const existingKey = `${field}_existing_refs`;
    const existingPathKey = `${field}_existing_path`;

    const galleryEnabled = !!campaignId && !!galleryCategory;
    const source = (data[sourceKey] as string) || '';
    const selectedPath = (data[existingPathKey] as string) || '';
    const [refPreviews, setRefPreviews] = useState<string[]>([]);
    const [galleryOpen, setGalleryOpen] = useState(false);

    function setSource(next: 'upload' | 'ai' | 'existing' | '') {
        setData(sourceKey, next);
        // Clear opposite fields to avoid stale data being submitted.
        if (next !== 'upload') setData(field, null);
        if (next !== 'ai') {
            setData(promptKey, '');
            setData(refsKey, []);
            setData(existingKey, []);
            setRefPreviews([]);
        }
        if (next !== 'existing') setData(existingPathKey, '');
        // Opening the gallery tab pops the picker immediately.
        if (next === 'existing') setGalleryOpen(true);
    }

    function toggleExisting(path: string) {
        const current = (data[existingKey] as string[]) || [];
        const next = current.includes(path)
            ? current.filter((p) => p !== path)
            : [...current, path];
        setData(existingKey, next);
    }

    return (
        <div className="rounded border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {currentPreview && (
                    <div className="group relative">
                        <img
                            src={currentPreview}
                            alt="atual"
                            className="h-16 w-16 rounded object-cover"
                        />
                        {onDelete && (
                            <DeleteImageButton
                                onConfirm={onDelete}
                                message="Remover esta imagem?"
                            />
                        )}
                    </div>
                )}
            </div>

            <div className="mb-3 flex gap-2 text-xs">
                <TabButton active={source === ''} onClick={() => setSource('')}>
                    Manter
                </TabButton>
                <TabButton active={source === 'upload'} onClick={() => setSource('upload')}>
                    Upload
                </TabButton>
                <TabButton
                    active={source === 'ai'}
                    onClick={() => !aiDisabled && setSource('ai')}
                    disabled={aiDisabled}
                    title={aiDisabled ? 'Defina IMAGE_DRIVER=openai no .env' : undefined}
                >
                    Gerar com IA
                </TabButton>
                {galleryEnabled && (
                    <TabButton active={source === 'existing'} onClick={() => setSource('existing')}>
                        Galeria
                    </TabButton>
                )}
            </div>

            {source === 'upload' && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData(field, e.target.files?.[0] ?? null)}
                        className="block w-full text-sm"
                    />
                    {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
                </div>
            )}

            {source === 'existing' && (
                <div className="flex items-center gap-3">
                    {selectedPath ? (
                        <img
                            src={asset(selectedPath)}
                            alt="selecionada"
                            className="h-16 w-16 rounded border object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed text-[10px] text-gray-400">
                            nenhuma
                        </div>
                    )}
                    <div>
                        <button
                            type="button"
                            onClick={() => setGalleryOpen(true)}
                            className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                            {selectedPath ? 'Trocar imagem' : 'Escolher da galeria'}
                        </button>
                        {errors[existingPathKey] && (
                            <p className="mt-1 text-xs text-red-600">{errors[existingPathKey]}</p>
                        )}
                    </div>
                </div>
            )}

            {source === 'ai' && (
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Prompt
                        </label>
                        <AutoTextarea
                            rows={3}
                            value={(data[promptKey] as string) || ''}
                            onChange={(e) => setData(promptKey, e.target.value)}
                            placeholder="Ex.: taverna medieval iluminada por lampião, atmosfera acolhedora, estilo pintura digital..."
                            className="block w-full text-sm"
                        />
                        {errors[promptKey] && (
                            <p className="mt-1 text-xs text-red-600">{errors[promptKey]}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Imagens de referência (opcional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                setData(refsKey, files);
                                setRefPreviews(files.map((f) => URL.createObjectURL(f)));
                            }}
                            className="block w-full text-sm"
                        />
                        {refPreviews.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {refPreviews.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        className="h-14 w-14 rounded border object-cover"
                                    />
                                ))}
                            </div>
                        )}
                        {errors[refsKey] && (
                            <p className="mt-1 text-xs text-red-600">{errors[refsKey]}</p>
                        )}
                    </div>

                    {existingRefs.length > 0 && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Ou reutilizar imagens existentes
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {existingRefs.map((ref) => {
                                    const selected = (
                                        (data[existingKey] as string[]) || []
                                    ).includes(ref.path);
                                    return (
                                        <button
                                            type="button"
                                            key={ref.path}
                                            onClick={() => toggleExisting(ref.path)}
                                            className={
                                                'group relative rounded border-2 p-1 text-left text-[10px] ' +
                                                (selected
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-transparent hover:border-gray-300')
                                            }
                                        >
                                            <img
                                                src={asset(ref.path)}
                                                alt=""
                                                className="h-16 w-full rounded object-cover"
                                            />
                                            <span className="mt-1 block truncate text-gray-600">
                                                {ref.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {galleryEnabled && (
                <ImageGalleryModal
                    show={galleryOpen}
                    campaignId={campaignId!}
                    defaultCategory={galleryCategory}
                    selectedPath={selectedPath || undefined}
                    onSelect={(img) => {
                        setData(existingPathKey, img.path);
                        setGalleryOpen(false);
                    }}
                    onClose={() => setGalleryOpen(false)}
                />
            )}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    disabled = false,
    title,
    children,
}: {
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={
                'rounded px-3 py-1 transition ' +
                (active
                    ? 'bg-indigo-600 text-white'
                    : disabled
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }
        >
            {children}
        </button>
    );
}
