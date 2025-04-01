
import { useState } from 'react';
import { Message, ModelSettings } from '@/types';
import { generateId } from '@/lib/conversation-utils';
import { useFileHandling } from './message/useFileHandling';
import { useMessageGeneration } from './message/useMessageGeneration';
import { useToast } from '@/hooks/use-toast';
import { isGptModel } from '@/hooks/useSettingsForm';
import { validateApiKeys } from '@/utils/api';

export function useMessageHandlers(
  selectedConversation: string | null,
  createNewConversation: (firstMessage?: Message) => string,
  addMessageToConversation: (conversationId: string, message: Message, isCompareMessage?: boolean) => boolean,
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>, isCompareMessage?: boolean) => boolean,
  setIsWaiting: (isWaiting: boolean) => void,
  form: any,
  saveSettings: (values: any) => void,
  updateConversation: (id: string, updates: Partial<any>) => void
) {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const {
    selectedFiles,
    setSelectedFiles,
    fileInputRef,
    handleFileChange,
    filesToDataURLs,
    getImage
  } = useFileHandling();
  
  const {
    sendMessageToAPI,
    createUserMessage,
    createAssistantMessage
  } = useMessageGeneration();

  const getModelSettings = (modelName: string, isPrimary: boolean): ModelSettings => {
    const settings = form.getValues();
    return isPrimary ? settings.primaryModelSettings : settings.secondaryModelSettings;
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && selectedFiles.length === 0) return;
    
    saveSettings(form.getValues());
    
    // Pre-validate API keys before attempting to send the message
    const settings = form.getValues();
    const primaryUseDeepSeek = settings.primaryModelSettings?.use_deepseek || false;
    const secondaryUseDeepSeek = settings.isSplitView ? (settings.secondaryModelSettings?.use_deepseek || false) : false;
    const useDeepSeek = primaryUseDeepSeek || secondaryUseDeepSeek;
    
    // Check if we have valid API keys
    const validation = validateApiKeys(useDeepSeek);
    if (!validation.isValid) {
      toast({
        title: "API Key Required",
        description: validation.errorMessage,
        variant: "destructive",
        duration: 5000
      });
      return;
    }
    
    setIsWaiting(true);
    
    try {
      const imageFiles: File[] = selectedFiles.slice();
      let imageIds: string[] = [];
      
      if (imageFiles.length > 0) {
        console.log(`Processing ${imageFiles.length} image files`);
        try {
          const dataUrls = await filesToDataURLs(imageFiles);
          imageIds = dataUrls.map(url => {
            const id = generateId();
            localStorage.setItem(`image-${id}`, url);
            return id;
          });
          console.log(`Created ${imageIds.length} image IDs`);
        } catch (error) {
          console.error("Error processing image files:", error);
          toast({
            title: "Error",
            description: "Failed to process image files",
            variant: "destructive"
          });
        }
      }
      
      const userMessage = createUserMessage(
        trimmedInput, 
        imageIds.length > 0 ? imageIds : undefined
      );
      console.log("Created user message:", userMessage);
      
      let conversationId = selectedConversation;
      let isNewConversation = false;
      
      if (!conversationId) {
        console.log("Creating new conversation for the first message");
        conversationId = createNewConversation();
        isNewConversation = true;
        console.log("Created new conversation with ID:", conversationId);
        
        if (!conversationId) {
          throw new Error("Failed to create a new conversation");
        }
      }
      
      console.log("Adding user message to conversation:", conversationId);
      const addResult = addMessageToConversation(conversationId, userMessage);
      console.log("Added user message to conversation, result:", addResult);
      
      if (!addResult) {
        throw new Error("Failed to add user message to conversation");
      }
      
      if (form.getValues("isSplitView")) {
        addMessageToConversation(conversationId, {...userMessage, id: generateId()}, true);
      }
      
      setInput("");
      setSelectedFiles([]);
      
      const primaryModel = form.getValues("model");
      const compareModel = form.getValues("compareModel");
      const settings = form.getValues();
      const isSplitView = form.getValues("isSplitView");
      const primaryModelSettings = form.getValues("primaryModelSettings");
      const secondaryModelSettings = form.getValues("secondaryModelSettings");
      
      updateConversation(conversationId, {
        model: primaryModel,
        compareModel: compareModel,
        isSplitView: isSplitView,
        primaryModelSettings: primaryModelSettings,
        secondaryModelSettings: secondaryModelSettings
      });
      
      try {
        const primarySessionId = conversationId;
        const compareSessionId = `${conversationId}_compare`;
        
        const primaryModelSettings = getModelSettings(primaryModel, true);
        
        const primaryMessageId = generateId();
        const primaryPlaceholder: Message = {
          id: primaryMessageId,
          role: "assistant" as const,
          content: "",
          timestamp: Date.now(),
          modelName: primaryModel,
          ...(isGptModel(primaryModel) ? {
            temperature: primaryModelSettings.temperature,
            maxTokens: primaryModelSettings.max_tokens,
            useDeepSeek: primaryModelSettings.use_deepseek
          } : {
            reasoningEffort: primaryModelSettings.reasoningEffort
          })
        };
        
        addMessageToConversation(conversationId, primaryPlaceholder);
        
        const responsePromises = [];
        
        const updatePrimaryStreamingContent = (content: string) => {
          updateMessage(conversationId, primaryMessageId, { content });
        };
        
        responsePromises.push(
          sendMessageToAPI(
            trimmedInput,
            primaryModel,
            settings,
            primarySessionId,
            imageFiles,
            updatePrimaryStreamingContent
          ).then(responseContent => {
            console.log("Got final primary API response, updating assistant message");
            const assistantMessage = createAssistantMessage(
              responseContent,
              primaryModel,
              getModelSettings(primaryModel, true)
            );
            
            return updateMessage(
              conversationId, 
              primaryMessageId, 
              { ...assistantMessage, status: "sent" }
            );
          })
          .catch(error => {
            // Handle API errors in a more user-friendly way
            console.error("Error with primary API call:", error);
            const errorMessage = error.message || "Unknown error occurred";
            
            return updateMessage(
              conversationId,
              primaryMessageId,
              { 
                content: `**Error:** ${errorMessage}`, 
                status: "error" 
              }
            );
          })
        );
        
        if (isSplitView) {
          const secondaryModelSettings = getModelSettings(compareModel, false);
          
          const compareMessageId = generateId();
          const comparePlaceholder: Message = {
            id: compareMessageId,
            role: "assistant" as const,
            content: "",
            timestamp: Date.now(),
            modelName: compareModel,
            ...(isGptModel(compareModel) ? {
              temperature: secondaryModelSettings.temperature,
              maxTokens: secondaryModelSettings.max_tokens,
              useDeepSeek: secondaryModelSettings.use_deepseek
            } : {
              reasoningEffort: secondaryModelSettings.reasoningEffort
            })
          };
          
          addMessageToConversation(conversationId, comparePlaceholder, true);
          
          const updateCompareStreamingContent = (content: string) => {
            updateMessage(conversationId, compareMessageId, { content }, true);
          };
          
          responsePromises.push(
            sendMessageToAPI(
              trimmedInput,
              compareModel,
              {
                ...settings,
                primaryModelSettings: settings.secondaryModelSettings
              },
              compareSessionId,
              imageFiles,
              updateCompareStreamingContent,
              false
            ).then(responseContent => {
              console.log("Got final compare API response, updating compare message");
              const compareMessage = createAssistantMessage(
                responseContent,
                compareModel,
                getModelSettings(compareModel, false)
              );
              
              return updateMessage(
                conversationId, 
                compareMessageId, 
                { ...compareMessage, status: "sent" }, 
                true
              );
            })
            .catch(error => {
              // Handle API errors in a more user-friendly way
              console.error("Error with secondary API call:", error);
              const errorMessage = error.message || "Unknown error occurred";
              
              return updateMessage(
                conversationId,
                compareMessageId,
                { 
                  content: `**Error:** ${errorMessage}`, 
                  status: "error" 
                },
                true
              );
            })
          );
        }
        
        await Promise.all(responsePromises);
        
        if (isNewConversation && conversationId) {
          let title = "Image Uploaded";
          
          if (trimmedInput) {
            title = trimmedInput.substring(0, 50) + (trimmedInput.length > 50 ? '...' : '');
          }
          
          updateConversation(conversationId, { title });
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        toast({
          title: "Error",
          description: "Failed to get response from AI. Please try again.",
          variant: "destructive",
          duration: 3000
        });
      } finally {
        setIsWaiting(false);
      }
    } catch (error) {
      console.error('Error in message handling:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while processing your message.",
        variant: "destructive",
        duration: 3000
      });
      setIsWaiting(false);
    }
  };

  return {
    input,
    setInput,
    selectedFiles,
    setSelectedFiles,
    fileInputRef,
    handleFileChange,
    handleSend,
    getImage
  };
}
