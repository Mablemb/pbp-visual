import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    children: string | null | undefined;
    fallback?: string;
    className?: string;
}

export default function MarkdownContent({ children, fallback, className = '' }: Props) {
    if (!children) {
        return fallback ? <p className="text-sm italic text-gray-500">{fallback}</p> : null;
    }

    return (
        <div className={`text-sm text-gray-700 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children: c }) => <h1 className="mb-2 mt-4 text-xl font-bold">{c}</h1>,
                    h2: ({ children: c }) => <h2 className="mb-2 mt-3 text-lg font-bold">{c}</h2>,
                    h3: ({ children: c }) => <h3 className="mb-1 mt-3 text-base font-semibold">{c}</h3>,
                    p: ({ children: c }) => <p className="mb-2 last:mb-0">{c}</p>,
                    strong: ({ children: c }) => <strong className="font-bold">{c}</strong>,
                    em: ({ children: c }) => <em className="italic">{c}</em>,
                    ul: ({ children: c }) => <ul className="mb-2 list-disc pl-5">{c}</ul>,
                    ol: ({ children: c }) => <ol className="mb-2 list-decimal pl-5">{c}</ol>,
                    li: ({ children: c }) => <li className="mb-0.5">{c}</li>,
                    blockquote: ({ children: c }) => (
                        <blockquote className="mb-2 border-l-4 border-gray-300 pl-4 italic text-gray-600">{c}</blockquote>
                    ),
                    code: ({ className: cls, children: c }) => {
                        const isBlock = /language-/.test(cls ?? '');
                        return isBlock ? (
                            <code className="my-2 block overflow-x-auto rounded bg-gray-100 p-3 font-mono text-sm">{c}</code>
                        ) : (
                            <code className="rounded bg-gray-100 px-1 font-mono text-sm">{c}</code>
                        );
                    },
                    a: ({ href, children: c }) => (
                        <a href={href} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {c}
                        </a>
                    ),
                    hr: () => <hr className="my-4 border-gray-200" />,
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
