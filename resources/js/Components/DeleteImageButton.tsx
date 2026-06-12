import { useState } from 'react';

interface Props {
    onConfirm: () => void;
    message: string;
}

export default function DeleteImageButton({ onConfirm, message }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute right-1 top-1 rounded bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600/80"
                title="Remover imagem"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="mb-5 text-sm text-gray-700">{message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => { onConfirm(); setOpen(false); }}
                                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
