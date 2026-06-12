
import {
    forwardRef,
    TextareaHTMLAttributes,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
} from 'react';

/**
 * Textarea que cresce verticalmente conforme o conteúdo, evitando
 * uma scrollbar interna em uma caixa de tamanho fixo. O atributo `rows`
 * funciona como altura mínima.
 */
export default forwardRef<
    HTMLTextAreaElement,
    TextareaHTMLAttributes<HTMLTextAreaElement>
>(function AutoTextarea(
    { className = '', value, rows = 3, onChange, ...props },
    ref,
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => localRef.current as HTMLTextAreaElement);

    const resize = () => {
        const el = localRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    useLayoutEffect(resize, [value]);

    return (
        <textarea
            {...props}
            ref={localRef}
            rows={rows}
            value={value}
            onChange={(e) => {
                onChange?.(e);
                resize();
            }}
            className={
                'resize-none overflow-hidden rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                className
            }
        />
    );
});
