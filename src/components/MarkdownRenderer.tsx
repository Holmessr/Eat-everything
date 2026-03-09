import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className, isUser = false }) => {
  return (
    <div className={cn("markdown-body text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize paragraphs to have proper spacing but not too much
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          
          // Lists
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          
          // Headings (reduce size for chat bubble context)
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
          
          // Code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className={cn("bg-black/10 px-1 py-0.5 rounded font-mono text-xs", isUser && "bg-white/20")} {...props}>
                {children}
              </code>
            ) : (
              <div className="bg-gray-800 text-gray-100 rounded-md p-2 my-2 overflow-x-auto text-xs">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            );
          },
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={cn("border-l-2 pl-2 italic my-2", isUser ? "border-white/50" : "border-gray-300 text-gray-600")}>
              {children}
            </blockquote>
          ),

          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={cn("underline", isUser ? "text-white hover:text-gray-200" : "text-blue-600 hover:text-blue-800")}
            >
              {children}
            </a>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 whitespace-nowrap text-gray-500">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
