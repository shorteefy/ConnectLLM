import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import MessageList from './MessageList';
import { GripVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SplitViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
  leftModelName: string;
  rightModelName: string;
  isWaiting?: boolean;
  useDeepSeek?: boolean;
  getImage: (id: string) => string | null;
  form?: any;
  className?: string;
}

const SplitView: React.FC<SplitViewProps> = ({
  leftMessages,
  rightMessages,
  leftModelName,
  rightModelName,
  isWaiting = false,
  useDeepSeek = false,
  getImage,
  form,
  className
}) => {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [primaryModelDisplayName, setPrimaryModelDisplayName] = useState(leftModelName);
  const [secondaryModelDisplayName, setSecondaryModelDisplayName] = useState(rightModelName);
  const [activeTab, setActiveTab] = useState("primary");
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Determine if each side is still waiting for a response
  const isPrimaryWaiting = isWaiting && !leftMessages.some(msg => 
    msg.role === 'assistant' && msg.status === 'sent'
  );
  
  const isSecondaryWaiting = isWaiting && !rightMessages.some(msg => 
    msg.role === 'assistant' && msg.status === 'sent'
  );

  // Set a more appropriate split position for mobile
  useEffect(() => {
    if (isMobile) {
      setSplitPosition(50); // Fixed 50/50 split on mobile
    }
  }, [isMobile]);

  const handleMouseDown = () => {
    if (isMobile) return; // Disable dragging on mobile
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || isMobile) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    const newPosition = (mouseX / containerWidth) * 100;
    
    // Clamp position between 20% and 80%
    const clampedPosition = Math.max(20, Math.min(80, newPosition));
    
    setSplitPosition(clampedPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Get useDeepSeek values for both primary and secondary models
  const getPrimaryUseDeepSeek = () => {
    if (!form) return false;
    return form.watch("primaryModelSettings.use_deepseek") || false;
  };
  
  const getSecondaryUseDeepSeek = () => {
    if (!form) return false;
    return form.watch("secondaryModelSettings.use_deepseek") || false;
  };
  
  // Helper to get model display name with DeepSeek suffix if applicable
  const getModelDisplayName = (modelName: string, isPrimary: boolean) => {
    if (!form) return modelName;
    
    // Use the model's settings to check for DeepSeek
    let useDeepSeekSetting: boolean;
    
    if (isPrimary) {
      useDeepSeekSetting = form.watch("primaryModelSettings.use_deepseek");
    } else {
      useDeepSeekSetting = form.watch("secondaryModelSettings.use_deepseek");
    }
    
    // If the first message has useDeepSeek property, use that instead
    if (isPrimary && leftMessages.length > 0 && leftMessages[0].role === 'assistant') {
      useDeepSeekSetting = leftMessages[0].useDeepSeek || useDeepSeekSetting;
    } else if (!isPrimary && rightMessages.length > 0 && rightMessages[0].role === 'assistant') {
      useDeepSeekSetting = rightMessages[0].useDeepSeek || useDeepSeekSetting;
    }
    
    if (useDeepSeekSetting && (modelName === "gpt-4o" || modelName === "gpt-4o-mini")) {
      return `${modelName} + DeepSeek`;
    }
    
    return modelName;
  };

  // Update display names when form values change
  useEffect(() => {
    if (form) {
      // Watch for changes to primary model and DeepSeek settings
      const subscription = form.watch((values: any) => {
        // Update primary model display name
        const primaryModel = values.model || leftModelName;
        const primaryUseDeepSeek = values.primaryModelSettings?.use_deepseek;
        const newPrimaryDisplayName = primaryUseDeepSeek && 
          (primaryModel === "gpt-4o" || primaryModel === "gpt-4o-mini") 
          ? `${primaryModel} + DeepSeek` 
          : primaryModel;
        setPrimaryModelDisplayName(newPrimaryDisplayName);
        
        // Update secondary model display name
        const secondaryModel = values.compareModel || rightModelName;
        const secondaryUseDeepSeek = values.secondaryModelSettings?.use_deepseek;
        const newSecondaryDisplayName = secondaryUseDeepSeek && 
          (secondaryModel === "gpt-4o" || secondaryModel === "gpt-4o-mini") 
          ? `${secondaryModel} + DeepSeek` 
          : secondaryModel;
        setSecondaryModelDisplayName(newSecondaryDisplayName);
      });
      
      return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      };
    }
  }, [form, leftModelName, rightModelName]);

  // Also update display names when prop values change
  useEffect(() => {
    setPrimaryModelDisplayName(getModelDisplayName(leftModelName, true));
    setSecondaryModelDisplayName(getModelDisplayName(rightModelName, false));
  }, [leftModelName, rightModelName]);

  // Layout is different on mobile - using Tabs component for better mobile experience
  if (isMobile) {
    return (
      <div ref={containerRef} className={cn("flex flex-col h-full overflow-hidden", className)}>
        <Tabs 
          defaultValue="primary" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-2 w-full rounded-none bg-gray-200 dark:bg-gray-700 p-0 h-auto border-b border-border">
            <TabsTrigger 
              value="primary" 
              className={`py-2.5 rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-foreground data-[state=inactive]:bg-transparent`}
            >
              <span className="truncate max-w-[120px] inline-block" title={primaryModelDisplayName}>
                {primaryModelDisplayName}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="secondary" 
              className={`py-2.5 rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-foreground data-[state=inactive]:bg-transparent`}
            >
              <span className="truncate max-w-[120px] inline-block" title={secondaryModelDisplayName}>
                {secondaryModelDisplayName}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 relative overflow-hidden">
            <TabsContent value="primary" className="m-0 absolute inset-0 h-full overflow-y-auto">
              <MessageList 
                messages={leftMessages} 
                isWaiting={isPrimaryWaiting} 
                useDeepSeek={getPrimaryUseDeepSeek()}
                getImage={getImage}
              />
            </TabsContent>
            
            <TabsContent value="secondary" className="m-0 absolute inset-0 h-full overflow-y-auto">
              <MessageList 
                messages={rightMessages} 
                isWaiting={isSecondaryWaiting} 
                useDeepSeek={getSecondaryUseDeepSeek()}
                getImage={getImage}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  // Desktop layout with side-by-side panels
  return (
    <div ref={containerRef} className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Headers with model names */}
      <div className="flex w-full bg-gray-200 dark:bg-gray-700 border-b border-border">
        <div 
          style={{ width: `${splitPosition}%` }} 
          className="p-2 text-center font-medium truncate"
          title={`Primary: ${primaryModelDisplayName}`}
        >
          <span className="hidden sm:inline">Primary:</span> {primaryModelDisplayName}
        </div>
        <div 
          style={{ width: `${100 - splitPosition}%` }} 
          className="p-2 text-center font-medium truncate"
          title={`Secondary: ${secondaryModelDisplayName}`}
        >
          <span className="hidden sm:inline">Secondary:</span> {secondaryModelDisplayName}
        </div>
      </div>
      
      {/* Content area with messages */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left panel */}
        <div style={{ width: `${splitPosition}%` }} className="h-full overflow-y-auto">
          <MessageList 
            messages={leftMessages} 
            isWaiting={isPrimaryWaiting} 
            useDeepSeek={getPrimaryUseDeepSeek()}
            getImage={getImage}
          />
        </div>
        
        {/* Resizable divider */}
        <div 
          className={`absolute inset-y-0 w-1 ${isDragging ? "bg-purple-500" : "bg-border"} flex items-center justify-center cursor-col-resize z-10`}
          style={{ 
            left: `${splitPosition}%`,
            transform: 'translateX(-50%)',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="absolute flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border cursor-col-resize shadow-md">
            <GripVertical className="h-3 w-3 text-purple-500" />
          </div>
        </div>
        
        {/* Right panel */}
        <div style={{ width: `${100 - splitPosition}%` }} className="h-full overflow-y-auto">
          <MessageList 
            messages={rightMessages} 
            isWaiting={isSecondaryWaiting} 
            useDeepSeek={getSecondaryUseDeepSeek()}
            getImage={getImage}
          />
        </div>
      </div>
    </div>
  );
};

export default SplitView;
