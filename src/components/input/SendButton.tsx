
import React from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface SendButtonProps {
  handleSend: () => void;
  isWaiting: boolean;
  hasContent: boolean;
  isSplitView: boolean;
  modelName: string;
}

const SendButton: React.FC<SendButtonProps> = ({
  handleSend,
  isWaiting,
  hasContent,
  isSplitView,
  modelName
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center relative">
      {/* Model indicator tooltip - hidden on mobile */}
      {!isSplitView && !isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs whitespace-nowrap">
                <BrainCircuit className="h-3 w-3" />
                {modelName}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current AI model</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Compact model indicator for mobile */}
      {!isSplitView && isMobile && (
        <div className="absolute -top-6 right-0 text-xs text-gray-500 dark:text-gray-400">
          {modelName.split(' ')[0]}
        </div>
      )}
      
      {/* Send button */}
      <Button
        size={isMobile ? "sm" : "default"}
        onClick={handleSend}
        disabled={isWaiting || !hasContent}
        className="px-3 sm:px-4"
      >
        {isWaiting ? "..." : "Send"}
      </Button>
    </div>
  );
};

export default SendButton;
