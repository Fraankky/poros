import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="article-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-sans text-[32px] font-extrabold leading-[1.2] mt-14 mb-2 tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-sans text-[26px] font-bold leading-[1.3] mt-12 mb-2 tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-sans text-[22px] font-semibold leading-[1.4] mt-9 mb-1 text-neutral-900 dark:text-neutral-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 text-[20px] leading-[1.75] tracking-[-0.003em] text-neutral-800 dark:text-neutral-200">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="underline underline-offset-[3px] decoration-neutral-400 hover:decoration-current transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3px] border-neutral-800 dark:border-neutral-400 pl-5 my-8 italic text-neutral-600 dark:text-neutral-400">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="pl-6 mb-6 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="pl-6 mb-6 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 text-[20px] leading-[1.75] text-neutral-800 dark:text-neutral-200">
              {children}
            </li>
          ),
          code: ({ className, children, inline }) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-5 md:p-6 rounded-lg overflow-x-auto my-8 leading-[1.6]">
                <code className={`font-mono text-[15px] ${match ? `language-${match[1]}` : ''}`}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="font-mono text-[0.875em] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400">
                {children}
              </code>
            )
          },
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full rounded-lg my-8 mx-auto block"
            />
          ),
          hr: () => (
            <hr className="border-none text-center my-12 before:content-['...'] before:text-[28px] before:tracking-[0.6em] before:text-neutral-400" />
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-neutral-900 dark:text-neutral-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
