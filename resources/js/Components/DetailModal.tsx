import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { PropsWithChildren } from 'react';

/**
 * Popup/overlay used to show resource details (image, title, description) on
 * top of the current page. Includes an X button to close and is responsive for
 * desktop and mobile. The panel scrolls internally so large content / zoomed
 * images are never cropped.
 */
export default function DetailModal({
    children,
    show,
    title,
    titleCentered = false,
    onClose,
}: PropsWithChildren<{
    show: boolean;
    title: string;
    titleCentered?: boolean;
    onClose: () => void;
}>) {
    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 transition-all"
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
                    <DialogPanel className="relative flex max-h-[90vh] w-full max-w-4xl transform flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 sm:px-6">
                            <h4
                                className={
                                    'text-lg font-semibold text-gray-900 ' +
                                    (titleCentered ? 'flex-1 text-center' : '')
                                }
                            >
                                {title}
                            </h4>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Fechar"
                                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
