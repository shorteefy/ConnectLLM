
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BrainCircuit, Download, KeyRound, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import SettingsSheet from './SettingsSheet';
import { Conversation, Message } from '@/types';
import { exportToMarkdown } from '@/lib/conversation-utils';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  selectedConversation: Conversation | null;
  compareMessages: Message[];
  form: any;
  saveSettings: (values: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  selectedConversation,
  compareMessages,
  form,
  saveSettings
}) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const location = useLocation();
  const isConfigPage = location.pathname === '/config';

  const handleExport = () => {
    if (!selectedConversation) return;
    
    // Generate Markdown
    const markdown = exportToMarkdown(
      selectedConversation, 
      compareMessages.length > 0 ? compareMessages : undefined
    );
    
    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedConversation.title.replace(/\s+/g, '-')}.md`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b bg-card">
      {/* Left: Logo and title */}
      <Link to="/" className="flex items-center space-x-2">
        <BrainCircuit className="h-5 w-5 text-primary" />
        <span className="text-xl font-bold">ConnectLLM</span>
      </Link>
      
      {/* Right: Action buttons */}
      <div className="flex items-center space-x-2">
        {/* Export Conversation */}
        {selectedConversation && selectedConversation.messages.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={handleExport}
                >
                  <Download className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Config Page Button - Only show on chat page */}
        {!isConfigPage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  asChild
                >
                  <Link to="/config">
                    <KeyRound className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set API Keys</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Theme Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Settings */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <SettingsSheet form={form} saveSettings={saveSettings} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Navbar;
