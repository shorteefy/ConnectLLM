
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConfigPage = () => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [deepSeekKey, setDeepSeekKey] = useState('');
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false);
  const [showDeepSeekWarning, setShowDeepSeekWarning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're already using stored keys in localStorage
    const storedOpenAIKey = localStorage.getItem('OPENAI_API_KEY');
    const storedDeepSeekKey = localStorage.getItem('DEEPSEEK_API_KEY');
    
    // Check if DeepSeek reasoning is enabled but no key is provided
    const settings = localStorage.getItem('settings');
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        const primaryDeepSeek = parsedSettings?.primaryModelSettings?.use_deepseek;
        const secondaryDeepSeek = parsedSettings?.secondaryModelSettings?.use_deepseek;
        setShowDeepSeekWarning((primaryDeepSeek || secondaryDeepSeek) && !storedDeepSeekKey);
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
    
    // Only set the API keys from localStorage if they exist and are not "Admin@12"
    if (storedOpenAIKey || storedDeepSeekKey) {
      setIsUsingLocalStorage(true);
      
      // Ensure we don't use "Admin@12" as a default value
      if (storedOpenAIKey && storedOpenAIKey !== "Admin@12") {
        setOpenAIKey(storedOpenAIKey);
      } else if (storedOpenAIKey === "Admin@12") {
        // Remove the unwanted value from localStorage
        localStorage.removeItem('OPENAI_API_KEY');
      }
      
      if (storedDeepSeekKey) {
        setDeepSeekKey(storedDeepSeekKey);
      }
    }
  }, []);

  const handleSaveToLocalStorage = () => {
    if (!openAIKey) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please enter an OpenAI API key to continue.",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('OPENAI_API_KEY', openAIKey);
    
    if (deepSeekKey) {
      localStorage.setItem('DEEPSEEK_API_KEY', deepSeekKey);
      setShowDeepSeekWarning(false);
    }
    
    setIsUsingLocalStorage(true);
    
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been saved to browser storage.",
    });
    
    navigate('/chat');
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem('OPENAI_API_KEY');
    localStorage.removeItem('DEEPSEEK_API_KEY');
    setOpenAIKey('');
    setDeepSeekKey('');
    setIsUsingLocalStorage(false);
    setShowDeepSeekWarning(false);
    
    toast({
      title: "API Keys Cleared",
      description: "Your stored API keys have been removed from browser storage.",
    });
  };

  const handleGoToChatWithoutKeys = () => {
    toast({
      title: "Proceeding Without API Keys",
      description: "You can explore the UI, but you'll need to add API keys to use the chat functionality.",
      variant: "default"
    });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure the API keys for ConnectLLM
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="border-red-300 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Keys Required</AlertTitle>
              <AlertDescription className="text-sm">
                You must provide your own OpenAI API key to use ConnectLLM. DeepSeek key is optional for advanced reasoning features.
              </AlertDescription>
            </Alert>
            
            {showDeepSeekWarning && (
              <Alert variant="destructive" className="border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-700 dark:text-yellow-400">DeepSeek API Key Missing</AlertTitle>
                <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-400">
                  DeepSeek reasoning is enabled in your settings, but you haven't provided a DeepSeek API key. Please add a key to use this feature.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai" className="flex items-center">
                  OpenAI API Key
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="openai"
                  type="password"
                  placeholder="sk-..."
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI's website</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deepseek" className={showDeepSeekWarning ? "flex items-center text-yellow-600 dark:text-yellow-400" : ""}>
                  DeepSeek API Key
                  {showDeepSeekWarning && <span className="text-yellow-600 dark:text-yellow-400 ml-1">*</span>}
                </Label>
                <Input
                  id="deepseek"
                  type="password"
                  placeholder="sk-..."
                  value={deepSeekKey}
                  onChange={(e) => setDeepSeekKey(e.target.value)}
                  className={showDeepSeekWarning ? "border-yellow-400 focus:border-yellow-500 dark:border-yellow-700" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">DeepSeek's website</a>
                </p>
              </div>
              
              {isUsingLocalStorage && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLocalStorage}
                    className="w-full text-destructive"
                  >
                    Clear Stored Keys
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleSaveToLocalStorage}
              className="w-full"
              disabled={!openAIKey}
            >
              Save & Continue
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoToChatWithoutKeys}
              className="w-full mt-2"
            >
              Skip for Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ConfigPage;
