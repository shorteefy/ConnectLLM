
import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, ModelSettings } from '@/types';
import { generateId } from '@/lib/conversation-utils';
import { useToast } from '@/hooks/use-toast';

export function useConversationState() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [compareMessages, setCompareMessages] = useState<Message[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const { toast } = useToast();
  const conversationsRef = useRef<Conversation[]>([]);

  // Keep a reference to the current conversations state
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        if (Array.isArray(parsedConversations)) {
          setConversations(parsedConversations);
          conversationsRef.current = parsedConversations;
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load your conversations",
        variant: "destructive"
      });
    }
  }, [toast]);

  // When a new conversation is selected, update messages
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversationsRef.current.find(c => c.id === selectedConversation);
      if (conversation) {
        setMessages(conversation.messages || []);
        setCompareMessages(conversation.compareMessages || []);
      }
    }
  }, [selectedConversation, conversations]);

  // Create a new conversation and return both its ID and the updated conversations array
  const createNewConversation = useCallback((firstMessage?: Message) => {
    // Create new conversation ID and session IDs
    const newId = generateId();
    const primarySessionId = generateId();
    const secondarySessionId = generateId();
    
    // Default model settings
    const defaultPrimaryModelSettings: ModelSettings = {
      temperature: 0.7,
      max_tokens: 16384,
      use_deepseek: false
    };
    
    const defaultSecondaryModelSettings: ModelSettings = {
      temperature: 0.7,
      max_tokens: 16384,
      use_deepseek: false
    };
    
    // Create the conversation object
    const newConversation: Conversation = {
      id: newId,
      title: "New Conversation",
      timestamp: Date.now(),
      messages: firstMessage ? [firstMessage] : [],
      compareMessages: [],
      primarySessionId,
      secondarySessionId,
      model: "gpt-4o",
      compareModel: "gpt-4o-mini",
      isSplitView: false,
      primaryModelSettings: defaultPrimaryModelSettings,
      secondaryModelSettings: defaultSecondaryModelSettings
    };
    
    // Update both state and ref immediately
    const updatedConversations = [newConversation, ...conversationsRef.current];
    conversationsRef.current = updatedConversations;
    setConversations(updatedConversations);
    
    // Save to localStorage
    try {
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
    
    console.log("Created new conversation with ID:", newId);
    
    // Select the new conversation
    setSelectedConversation(newId);
    setMessages(firstMessage ? [firstMessage] : []);
    setCompareMessages([]);
    
    return newId;
  }, []);

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    // Find the conversation first to verify it exists
    const conversationExists = conversationsRef.current.some(conv => conv.id === id);
    if (!conversationExists) {
      console.error(`Cannot update conversation with ID ${id} - not found`);
      return;
    }
    
    const updatedConversations = conversationsRef.current.map((conv) => 
      conv.id === id ? { ...conv, ...updates } : conv
    );
    
    // Update both state and ref
    conversationsRef.current = updatedConversations;
    setConversations(updatedConversations);
    
    // Update localStorage
    try {
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error saving updated conversations to localStorage:', error);
    }
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const updatedConversations = conversationsRef.current.filter((conv) => conv.id !== id);
    
    // Update both state and ref
    conversationsRef.current = updatedConversations;
    setConversations(updatedConversations);
    
    // Update localStorage
    try {
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error saving conversations after deletion to localStorage:', error);
    }
    
    // If we deleted the selected conversation, clear selection
    if (selectedConversation === id) {
      setSelectedConversation(null);
      setMessages([]);
      setCompareMessages([]);
    }
  }, [selectedConversation]);

  const updateConversationTitle = useCallback((id: string, newTitle: string) => {
    updateConversation(id, { title: newTitle });
  }, [updateConversation]);

  // Improved addMessageToConversation function
  const addMessageToConversation = useCallback(
    (conversationId: string, message: Message, isCompareMessage: boolean = false) => {
      console.log(`Adding ${isCompareMessage ? 'compare ' : ''}message to conversation: ${conversationId}`);
      
      // Using the ref to ensure we have the most up-to-date conversations
      const conversation = conversationsRef.current.find(c => c.id === conversationId);
      
      if (!conversation) {
        console.error(`Conversation with ID ${conversationId} not found`);
        console.log("Available conversations:", conversationsRef.current.map(c => c.id).join(', '));
        toast({
          title: "Error",
          description: "Failed to add message to conversation",
          variant: "destructive"
        });
        return false;
      }
      
      // Find the index of the conversation
      const conversationIndex = conversationsRef.current.findIndex(c => c.id === conversationId);
      
      if (isCompareMessage) {
        const updatedCompareMessages = [...(conversation.compareMessages || []), message];
        
        // Update state first for immediate UI update
        setCompareMessages(updatedCompareMessages);
        
        // Then update in the conversations array
        const updatedConversation = { 
          ...conversation,
          compareMessages: updatedCompareMessages,
          timestamp: Date.now() 
        };
        
        const updatedConversations = [
          ...conversationsRef.current.slice(0, conversationIndex),
          updatedConversation,
          ...conversationsRef.current.slice(conversationIndex + 1)
        ];
        
        // Update state and ref
        conversationsRef.current = updatedConversations;
        setConversations(updatedConversations);
        
        // Save to localStorage
        try {
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        } catch (error) {
          console.error('Error saving conversations to localStorage:', error);
        }
      } else {
        const updatedMessages = [...(conversation.messages || []), message];
        
        // Update state first for immediate UI update
        setMessages(updatedMessages);
        
        // Then update in the conversations array
        const updatedConversation = { 
          ...conversation,
          messages: updatedMessages,
          timestamp: Date.now() 
        };
        
        const updatedConversations = [
          ...conversationsRef.current.slice(0, conversationIndex),
          updatedConversation,
          ...conversationsRef.current.slice(conversationIndex + 1)
        ];
        
        // Update state and ref
        conversationsRef.current = updatedConversations;
        setConversations(updatedConversations);
        
        // Save to localStorage
        try {
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        } catch (error) {
          console.error('Error saving conversations to localStorage:', error);
        }
      }
      
      return true;
    },
    [toast]
  );

  const updateMessage = useCallback(
    (conversationId: string, messageId: string, updates: Partial<Message>, isCompareMessage: boolean = false) => {
      // Find the conversation using the ref for the most up-to-date state
      const conversationIndex = conversationsRef.current.findIndex(c => c.id === conversationId);
      if (conversationIndex === -1) return false;
      
      const conversation = conversationsRef.current[conversationIndex];
      
      // Update message in the right array
      if (isCompareMessage && conversation.compareMessages) {
        const messageIndex = conversation.compareMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return false;
        
        const updatedMessages = [...conversation.compareMessages];
        updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], ...updates };
        
        // Update state first
        setCompareMessages(updatedMessages);
        
        // Then update storage
        const updatedConversation = { ...conversation, compareMessages: updatedMessages };
        const updatedConversations = [
          ...conversationsRef.current.slice(0, conversationIndex),
          updatedConversation,
          ...conversationsRef.current.slice(conversationIndex + 1)
        ];
        
        // Update state and ref
        conversationsRef.current = updatedConversations;
        setConversations(updatedConversations);
        
        // Save to localStorage
        try {
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        } catch (error) {
          console.error('Error saving conversations to localStorage:', error);
        }
      } else if (conversation.messages) {
        const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return false;
        
        const updatedMessages = [...conversation.messages];
        
        // Preserve reasoningTime if it exists in the updates
        if (updates.reasoningTime !== undefined) {
          console.log(`Updating message ${messageId} with reasoningTime: ${updates.reasoningTime}s`);
        }
        
        updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], ...updates };
        
        // Update state first
        setMessages(updatedMessages);
        
        // Then update storage
        const updatedConversation = { ...conversation, messages: updatedMessages };
        const updatedConversations = [
          ...conversationsRef.current.slice(0, conversationIndex),
          updatedConversation,
          ...conversationsRef.current.slice(conversationIndex + 1)
        ];
        
        // Update state and ref
        conversationsRef.current = updatedConversations;
        setConversations(updatedConversations);
        
        // Save to localStorage
        try {
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        } catch (error) {
          console.error('Error saving conversations to localStorage:', error);
        }
      }
      
      return true;
    },
    []
  );

  return {
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
  };
}
