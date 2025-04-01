
import React, { useEffect, useState } from 'react';
import ChatPage from "@/components/ChatPage";
import { useToast } from "@/hooks/use-toast";
import { validateApiKeys } from "@/utils/api";
import ApiKeyWarning from "@/components/ApiKeyWarning";

const Index = () => {
  const { toast } = useToast();
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);

  useEffect(() => {
    const clearErrors = () => {
      console.log("Index page mounted, clearing any stale error states");
    };
    
    clearErrors();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page became visible again");
        checkApiKeys();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const initializeDefaultSettings = () => {
      try {
        if (!localStorage.getItem('settings')) {
          const defaultSettings = {
            provider: "openai",
            model: "gpt-4o-mini",
            compareModel: "gpt-4o",
            primaryModelSettings: {
              temperature: 0.7,
              max_tokens: 16384,
              use_deepseek: false
            },
            secondaryModelSettings: {
              temperature: 0.7,
              max_tokens: 16384,
              use_deepseek: false,
              reasoningEffort: "medium"
            },
            isSplitView: false,
            conversation_memory: "last_10"
          };
          
          localStorage.setItem('settings', JSON.stringify(defaultSettings));
          console.log("Initialized default settings");
        }
      } catch (error) {
        console.error("Error initializing default settings:", error);
      }
    };
    
    initializeDefaultSettings();
    checkApiKeys();
    
    // Set up event listener for settings changes to recheck for API keys
    window.addEventListener('settingsChanged', checkApiKeys);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('settingsChanged', checkApiKeys);
    };
  }, [toast]);
  
  // Check API keys and update warning message
  const checkApiKeys = () => {
    try {
      // Get the current settings 
      const settings = localStorage.getItem('settings');
      if (!settings) return;
      
      const parsedSettings = JSON.parse(settings);
      
      // Check if DeepSeek is enabled in either model
      const isPrimaryDeepSeekEnabled = parsedSettings?.primaryModelSettings?.use_deepseek || false;
      const isSecondaryDeepSeekEnabled = parsedSettings?.secondaryModelSettings?.use_deepseek || false;
      const useDeepSeek = isPrimaryDeepSeekEnabled || isSecondaryDeepSeekEnabled;
      
      // Validate API keys
      const validation = validateApiKeys(useDeepSeek);
      
      if (!validation.isValid) {
        setApiKeyWarning(validation.errorMessage);
      } else {
        setApiKeyWarning(null);
      }
    } catch (error) {
      console.error("Error checking API keys:", error);
    }
  };

  return (
    <>
      {apiKeyWarning && <ApiKeyWarning message={apiKeyWarning} />}
      <ChatPage />
    </>
  );
};

export default Index;
