import React, { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import { BrainCircuit } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isWaiting?: boolean;
  useDeepSeek?: boolean;
  getImage: (id: string) => string | null;
  className?: string;
}

const LoadingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 animate-pulse mt-4">
    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animation-delay-200"></div>
    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animation-delay-400"></div>
  </div>
);

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isWaiting = false, 
  useDeepSeek = false,
  getImage,
  className 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, messages.length]);

  // Also add scroll effect when message content changes
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.status === "sending") {
      scrollToBottom();
    }
  }, [messages.map(m => m.content).join("")]);

  // Find the last assistant message to mark as streaming
  const lastAssistantMessageIndex = [...messages].reverse()
    .findIndex(msg => msg.role === 'assistant');
  
  const isLastAssistantMessage = (message: Message, index: number) => {
    return message.role === 'assistant' && 
           (messages.length - 1 - index === lastAssistantMessageIndex && 
            isWaiting) || message.status === "sending";
  };

  // Check if we have any assistant message that's still sending/streaming
  const hasStreamingMessage = messages.some(msg => 
    msg.role === 'assistant' && (msg.status === 'sending' || (isWaiting && !msg.status))
  );

  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      <div className="max-w-4xl mx-auto space-y-6 pt-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 p-8 text-center">
            {/* Hero section with gradient background */}
            <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 shadow-lg backdrop-blur-sm border border-primary/10 animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary/20 p-4 rounded-full">
                  <div className="bg-primary/80 p-3 rounded-full">
                    <div className="bg-primary text-white p-2 rounded-full">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Welcome to ConnectLLM
              </h1>
              <p className="text-muted-foreground text-lg mt-4">
                Your Companion to Enhance Non-reasoning LLMs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              {/* Feature card */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="m9 12 2 2 4-4"></path>
                  </svg>
                  Choose Your Model
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select from OpenAI models (4o, 4o-mini, o1, o1-mini) in Settings
                </p>
              </div>

              {/* Feature card */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M7 12a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v0"></path><path d="M12 7v10"></path><path d="M10 9v0"></path><path d="M14 9v0"></path>
                  </svg>
                  Deep Seek Reasoning
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enhance models like GPT-4o with Deep Seek reasoning capabilities
                </p>
              </div>

              {/* Feature card */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect width="8" height="18" x="3" y="3" rx="1"></rect><rect width="8" height="18" x="13" y="3" rx="1"></rect>
                  </svg>
                  Split View Mode
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compare two models side-by-side for better evaluation
                </p>
              </div>

              {/* Feature card */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="m3 21 9-9"></path><path d="M12.2 12.2 20 4.4c.6-.6.6-1.5 0-2.1-.6-.6-1.5-.6-2.1 0l-7.8 7.8"></path><path d="m18 22 4-11-11 4"></path>
                  </svg>
                  Start Chatting
                </h3>
                <p className="text-sm text-muted-foreground">
                  Type your message below to begin your conversation
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                useDeepSeek={useDeepSeek || message.useDeepSeek}
                getImage={getImage}
                isStreaming={isLastAssistantMessage(message, index) || message.status === "sending"}
              />
            ))}
          </>
        )}
        
        {/* Only show the loading indicator if we're waiting AND there's no assistant message yet */}
        {isWaiting && lastAssistantMessageIndex === -1 && !hasStreamingMessage && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
