import { useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import type { Options } from 'easymde';
import 'easymde/dist/easymde.min.css';

interface Props {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    minHeight?: string;
}

export default function MarkdownEditor({ value, onChange, id, placeholder = '', minHeight = '140px' }: Props) {
    const options = useMemo((): Options => ({
        spellChecker: false,
        placeholder,
        minHeight,
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'unordered-list', 'ordered-list', '|',
            'link', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide',
        ],
        status: false,
    }), [placeholder, minHeight]);

    return <SimpleMDE id={id} value={value} onChange={onChange} options={options} />;
}
