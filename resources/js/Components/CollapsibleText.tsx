interface Props {
    text: string;
    expanded: boolean;
    onToggle: () => void;
    collapsedLines?: 1 | 2 | 3;
    buttonClassName?: string;
    contentClassName?: string;
    toggleClassName?: string;
    expandLabel?: string;
    collapseLabel?: string;
}

export default function CollapsibleText({
    text,
    expanded,
    onToggle,
    collapsedLines = 2,
    buttonClassName = 'w-full text-left',
    contentClassName = 'text-sm text-gray-600',
    toggleClassName = 'mt-2 inline-flex text-xs font-medium text-indigo-600 hover:text-indigo-700',
    expandLabel = 'Expandir',
    collapseLabel = 'Recolher',
}: Props) {
    const clampClass =
        collapsedLines === 1
            ? 'line-clamp-1'
            : collapsedLines === 3
              ? 'line-clamp-3'
              : 'line-clamp-2';

    return (
        <button
            type="button"
            onClick={onToggle}
            className={buttonClassName}
            aria-expanded={expanded}
        >
            <p className={`${contentClassName} ${expanded ? 'whitespace-pre-line' : clampClass}`}>{text}</p>
            <span className={toggleClassName}>{expanded ? collapseLabel : expandLabel}</span>
        </button>
    );
}
