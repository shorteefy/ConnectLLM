
import React, { useEffect } from 'react';
import { useConversationState } from '@/hooks/useConversationState';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { useMessageHandlers } from '@/hooks/useMessageHandlers';
import MainLayout from './MainLayout';
import { useToast } from '@/hooks/use-toast';

const ChatPage: React.FC = () => {
  const { toast } = useToast();
  // Set up conversation state
  const {
    conversations,
    selectedConversation,
    messages,
    compareMessages,
    isWaiting,
    setSelectedConversation,
    setMessages,
    setCompareMessages,
    setIsWaiting,
    createNewConversation,
    updateConversation,
    deleteConversation,
    updateConversationTitle,
    addMessageToConversation,
    updateMessage
  } = useConversationState();
  
  // Set up settings form
  const { form, saveSettings } = useSettingsForm();
  
  // Set up message handlers
  const {
    input,
    setInput,
    selectedFiles,
    setSelectedFiles,
    fileInputRef,
    handleFileChange,
    handleSend,
    getImage
  } = useMessageHandlers(
    selectedConversation,
    createNewConversation,
    addMessageToConversation,
    updateMessage,
    setIsWaiting,
    form,
    saveSettings,
    updateConversation
  );
  
  // Handle conversation selection and properly maintain split view state
  const onSelectConversation = (id: string) => {
    const selectedConv = conversations.find(conv => conv.id === id);
    if (selectedConv) {
      console.log("Selected conversation settings:", {
        isSplitView: selectedConv.isSplitView,
        model: selectedConv.model,
        compareModel: selectedConv.compareModel,
        primaryModelSettings: selectedConv.primaryModelSettings,
        secondaryModelSettings: selectedConv.secondaryModelSettings
      });
      
      // Reset form first
      form.reset();
      
      // Apply conversation-specific settings
      const isSplitView = selectedConv.isSplitView || false;
      const model = selectedConv.model || 'gpt-4o';
      const compareModel = selectedConv.compareModel || 'gpt-4o-mini';
      
      // Update form values with conversation settings
      form.setValue('isSplitView', isSplitView);
      form.setValue('model', model);
      form.setValue('compareModel', compareModel);
      
      // Set primary model settings if available
      if (selectedConv.primaryModelSettings) {
        form.setValue('primaryModelSettings', selectedConv.primaryModelSettings);
      }
      
      // Set secondary model settings if available
      if (selectedConv.secondaryModelSettings) {
        form.setValue('secondaryModelSettings', selectedConv.secondaryModelSettings);
      }
      
      // Force form to update and validate
      form.trigger(['isSplitView', 'model', 'compareModel', 'primaryModelSettings', 'secondaryModelSettings']);
      
      // Save settings to localStorage to ensure they persist
      saveSettings(form.getValues());
      
      // Set messages
      setMessages(selectedConv.messages || []);
      
      // Set compare messages if this is a split view conversation
      if (isSplitView) {
        setCompareMessages(selectedConv.compareMessages || []);
      } else {
        setCompareMessages([]);
      }
      
      // Update selected conversation
      setSelectedConversation(id);
      
      console.log(`Selected conversation ${id}, split view: ${isSplitView}, model: ${model}, compareModel: ${compareModel}`);
    } else {
      setMessages([]);
      setCompareMessages([]);
      setSelectedConversation(id);
    }
  };
  
  // Handle conversation deletion
  const onDeleteConversation = (id: string) => {
    // Check if this is the selected conversation
    if (selectedConversation === id) {
      // Clear selection and messages
      setSelectedConversation(null);
      setMessages([]);
      setCompareMessages([]);
    }
    
    // Delete the conversation
    deleteConversation(id);
  };
  
  // Get selected conversation object
  const getSelectedConversation = () => {
    if (!selectedConversation) return null;
    return conversations.find(conv => conv.id === selectedConversation) || null;
  };
  
  // Start a new chat without creating a conversation immediately
  const onNewChat = () => {
    // Reset input
    setInput('');
    setSelectedFiles([]);
    
    // Clear the current conversation selection and messages
    setSelectedConversation(null);
    setMessages([]);
    setCompareMessages([]);
  };
  
  // Listen for split view changes and start a new chat when the mode changes
  useEffect(() => {
    const handleSplitViewChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const isSplitView = customEvent.detail?.isSplitView;
      
      // Always start a new chat when split view mode changes
      if (selectedConversation) {
        // Start a new chat without showing a toast
        onNewChat();
      }
    };
    
    window.addEventListener('splitViewChanged', handleSplitViewChange);
    return () => {
      window.removeEventListener('splitViewChanged', handleSplitViewChange);
    };
  }, [selectedConversation, onNewChat]);

  return (
    <MainLayout
      conversations={conversations}
      selectedConversation={selectedConversation}
      getSelectedConversation={getSelectedConversation}
      messages={messages}
      compareMessages={compareMessages}
      isWaiting={isWaiting}
      onSelectConversation={onSelectConversation}
      onDeleteConversation={onDeleteConversation}
      onUpdateTitle={updateConversationTitle}
      onNewChat={onNewChat}
      input={input}
      setInput={setInput}
      handleSend={handleSend}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      fileInputRef={fileInputRef}
      handleFileChange={handleFileChange}
      getImage={getImage}
      form={form}
      saveSettings={saveSettings}
    />
  );
};

export default ChatPage;
