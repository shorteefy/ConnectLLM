
import React from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../styles/streaming.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

// Process content to handle additional LaTeX formats
const processLatexFormats = (content: string): string => {
  if (!content) return "";
  
  // Replace \( ... \) with $ ... $ for inline math
  let processed = content.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);
  
  // Replace \[ ... \] with $$ ... $$ for block math
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`);
  
  return processed;
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = "", isStreaming = false }) => {
  // Process content to handle additional LaTeX formats
  const processedContent = processLatexFormats(content || "");
  
  return (
    <div className={cn("markdown-wrapper", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        className={cn("prose dark:prose-invert break-words", className)}
      >
        {processedContent}
      </ReactMarkdown>
      {isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
    </div>
  );
};

export default MarkdownContent;
