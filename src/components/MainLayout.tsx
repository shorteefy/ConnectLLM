
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import SplitView from './SplitView';
import InputArea from './InputArea';
import { Conversation, Message } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  getSelectedConversation: () => Conversation | null;
  messages: Message[];
  compareMessages: Message[];
  isWaiting: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onNewChat: () => void;
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getImage: (id: string) => string | null;
  form: any;
  saveSettings: (values: any) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  conversations,
  selectedConversation,
  getSelectedConversation,
  messages,
  compareMessages,
  isWaiting,
  onSelectConversation,
  onDeleteConversation,
  onUpdateTitle,
  onNewChat,
  input,
  setInput,
  handleSend,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  handleFileChange,
  getImage,
  form,
  saveSettings
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  
  // Set mounted to true after initial render
  useEffect(() => {
    setMounted(true);
    // Auto-close sidebar on mobile devices
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle new chat event from browser
  useEffect(() => {
    const handleNewChatEvent = () => {
      onNewChat();
    };

    window.addEventListener('newChat', handleNewChatEvent);
    return () => {
      window.removeEventListener('newChat', handleNewChatEvent);
    };
  }, [onNewChat]);

  // Get current conversation data
  const selectedConversationData = getSelectedConversation();
  
  // Use the conversation's isSplitView value if available, otherwise fall back to form value
  const isSplitViewMode = selectedConversationData ? 
    (selectedConversationData.isSplitView || false) : 
    form.watch('isSplitView');

  // Don't render until mounted to prevent hydration errors
  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar 
        selectedConversation={selectedConversationData} 
        compareMessages={compareMessages}
        form={form}
        saveSettings={saveSettings}
      />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {/* Sidebar toggle button - don't show toggle in split view mode */}
        {!isSplitViewMode && (
          <Button
            variant="ghost" 
            size="icon"
            className={`h-8 w-8 absolute left-0 top-[52px] z-20 m-2 hover:bg-gray-300 dark:hover:bg-sidebar-accent ${isMobile ? 'block' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
        )}
        
        {/* Sidebar - conditionally fixed or absolute for mobile */}
        <div className={`
          ${isMobile ? 'absolute' : 'fixed'} h-[calc(100vh-3.5rem)] top-14 z-30
          ${isSidebarOpen ? 'w-64 sm:w-64' : 'w-0'} 
          ${isSplitViewMode && !isMobile ? '!w-64' : ''} 
          transition-all duration-300 ease-in-out
          overflow-hidden border-r bg-sidebar
        `}>
          <Sidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              // Auto-close sidebar on mobile after selection
              if (isMobile) {
                setIsSidebarOpen(false);
              }
            }}
            onDeleteConversation={onDeleteConversation}
            onUpdateTitle={onUpdateTitle}
            onNewChat={() => {
              onNewChat();
              // Auto-close sidebar on mobile after new chat
              if (isMobile) {
                setIsSidebarOpen(false);
              }
            }}
            isSidebarOpen={isSidebarOpen || (isSplitViewMode && !isMobile)}
          />
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Chat content */}
        <div className={`
          flex flex-col h-full
          ${(isSidebarOpen && !isMobile) || (isSplitViewMode && !isMobile) ? 'ml-64' : 'ml-0'}
          transition-all duration-300 ease-in-out
        `}>
          {/* Chat messages area */}
          {isSplitViewMode ? (
            <SplitView
              leftMessages={messages}
              rightMessages={compareMessages}
              leftModelName={selectedConversationData?.model || form.watch("model")}
              rightModelName={selectedConversationData?.compareModel || form.watch("compareModel")}
              isWaiting={isWaiting}
              useDeepSeek={selectedConversationData?.primaryModelSettings?.use_deepseek || form.watch("primaryModelSettings.use_deepseek")}
              getImage={getImage}
              form={form}
              className="flex-1"
            />
          ) : (
            <MessageList 
              messages={messages} 
              isWaiting={isWaiting} 
              useDeepSeek={selectedConversationData?.primaryModelSettings?.use_deepseek || form.watch("primaryModelSettings.use_deepseek")}
              getImage={getImage}
            />
          )}
          
          {/* Input area */}
          <InputArea
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isWaiting={isWaiting}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            form={form}
          />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
