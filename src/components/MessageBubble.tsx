
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import MarkdownContent from './MarkdownContent';

interface MessageBubbleProps {
  message: Message;
  useDeepSeek?: boolean;
  getImage: (id: string) => string | null;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  useDeepSeek = false,
  getImage,
  isStreaming = false
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);
  const reasoningContentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(message.timestamp || Date.now());

  const parts = message.role === 'assistant' 
    ? message.content.split('-----REASONING_END-----')
    : [null, message.content];
    
  const hasReasoning = parts.length > 1 && message.role === 'assistant';
  const reasoning = hasReasoning ? parts[0] : null;
  const actualContent = hasReasoning ? parts[1] : message.content;

  // Fix: Only show reasoning when it's explicitly enabled for this specific message
  // and when actual reasoning content is present in the message
  const showReasoning = 
    message.role === 'assistant' && 
    (message.modelName === 'gpt-4o' || message.modelName === 'gpt-4o-mini') &&
    message.useDeepSeek === true && 
    hasReasoning;

  const handleScroll = () => {
    if (!reasoningContentRef.current) return;
    
    const { scrollHeight, scrollTop, clientHeight } = reasoningContentRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    setUserScrolled(!isAtBottom);
  };

  useEffect(() => {
    if (!message.imageIds || message.imageIds.length === 0) return;
    
    const loadImages = async () => {
      const urls = new Map<string, string>();
      
      for (const id of message.imageIds) {
        const url = getImage(id);
        if (url) {
          urls.set(id, url);
          console.log(`Loaded image ${id}`);
        } else {
          console.error(`Failed to load image ${id}`);
        }
      }
      
      setImageUrls(urls);
    };
    
    loadImages();
    
    return () => {
    };
  }, [message.imageIds, getImage]);

  useEffect(() => {
    if (isReasoningExpanded && reasoningContentRef.current && !userScrolled) {
      reasoningContentRef.current.scrollTop = reasoningContentRef.current.scrollHeight;
    }
  }, [isReasoningExpanded, reasoning, userScrolled]);

  const downloadReasoning = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!reasoning) return;
    
    const blob = new Blob([reasoning], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `reasoning-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`
          rounded-lg px-5 ${message.role === 'user' ? 'py-2' : 'py-4'}
          ${message.role === 'user' 
            ? 'bg-primary text-primary-foreground max-w-[60%]' 
            : 'bg-gray-100 dark:bg-gray-800 border inline-block max-w-full w-full'}
        `}
      >
        {message.imageIds && message.imageIds.length > 0 && (
          <div 
            className={`
              grid
              ${message.imageIds.length === 1 ? 'grid-cols-1' : 
                message.imageIds.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}
              gap-2 w-full
              ${actualContent ? 'mb-4' : ''}
            `}
          >
            {message.imageIds.map((id) => (
              <div 
                key={id}
                className="cursor-pointer relative pb-[100%] overflow-hidden"
                onClick={() => setSelectedImage(id)}
              >
                {imageUrls.get(id) ? (
                  <img
                    src={imageUrls.get(id) || ''}
                    alt="Uploaded content"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      console.error(`Error loading image: ${id}`);
                      e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/%3E%3Cpath d="M15 9L9 15" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/%3E%3Cpath d="M9 9L15 15" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Loading image...
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {showReasoning && (
          <div className="mb-4">
            <button 
              onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className={`h-4 w-4 transition-transform ${isReasoningExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Reasoning
              
              {reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={downloadReasoning}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download Reasoning</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </button>
            
            <div
              style={{
                maxHeight: isReasoningExpanded ? '400px' : '0',
                opacity: isReasoningExpanded ? 1 : 0,
                padding: isReasoningExpanded ? '0.75rem' : '0',
                marginBottom: isReasoningExpanded ? '0.75rem' : '0'
              }}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded transition-all duration-200 ease-in-out overflow-hidden"
            >
              <div 
                ref={reasoningContentRef}
                style={{ maxHeight: isReasoningExpanded ? '400px' : '0' }}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert overflow-y-auto overflow-x-hidden"
                onScroll={handleScroll}
              >
                {hasReasoning ? (
                  <MarkdownContent content={reasoning} />
                ) : (
                  <div className="p-3 flex items-center justify-center">
                    <span className="animate-pulse flex items-center">
                      Generating reasoning...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="break-words prose dark:prose-invert text-sm sm:text-base">
          <MarkdownContent 
            content={actualContent} 
            className="pl-2"
            isStreaming={isStreaming && message.role === 'assistant'}
          />
        </div>
        
        {message.role === 'assistant' && (
          <div className="mt-2 pt-1 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
            {message.modelName && (
              <div>
                Model: <span className="font-mono">{message.modelName}{message.useDeepSeek ? ' + DeepSeek' : ''}</span>
              </div>
            )}
            {(message.modelName === 'gpt-4o' || message.modelName === 'gpt-4o-mini') && message.temperature !== undefined && (
              <div>
                Temperature: <span className="font-mono">{message.temperature}</span>
              </div>
            )}
            {(message.modelName === 'gpt-4o' || message.modelName === 'gpt-4o-mini') && message.maxTokens !== undefined && (
              <div>
                Max Tokens: <span className="font-mono">{message.maxTokens}</span>
              </div>
            )}
            {(message.modelName === 'o1' || message.modelName === 'o3-mini') && message.reasoningEffort !== undefined && (
              <div>
                Reasoning Effort: <span className="font-mono">{message.reasoningEffort}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden mx-2 sm:mx-4">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {selectedImage && imageUrls.get(selectedImage) && (
            <img
              src={imageUrls.get(selectedImage) || ''}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded p-2 sm:p-4"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageBubble;
