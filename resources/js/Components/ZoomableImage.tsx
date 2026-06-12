import { useState } from 'react';

interface Props {
    src: string;
    alt: string;
}

/**
 * Displays an image fully (never cropped) and lets the user click/tap to zoom
 * in for details. When zoomed the image keeps its natural size and the wrapper
 * scrolls, which works for both desktop and mobile.
 */
export default function ZoomableImage({ src, alt }: Props) {
    const [zoomed, setZoomed] = useState(false);

    return (
        <div className="space-y-1">
            <div
                className={
                    'flex max-h-[70vh] justify-center overflow-auto rounded-lg bg-gray-100 ' +
                    (zoomed ? 'items-start' : 'items-center')
                }
            >
                <img
                    src={src}
                    alt={alt}
                    onClick={() => setZoomed((current) => !current)}
                    className={
                        zoomed
                            ? 'max-w-none cursor-zoom-out'
                            : 'max-h-[70vh] w-auto max-w-full cursor-zoom-in object-contain'
                    }
                />
            </div>
            <p className="text-center text-xs text-gray-400">
                {zoomed ? 'Clique na imagem para reduzir' : 'Clique na imagem para ampliar'}
            </p>
        </div>
    );
}
