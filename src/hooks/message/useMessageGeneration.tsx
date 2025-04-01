
import { Message, ModelSettings } from '@/types';
import { isGptModel } from '@/hooks/useSettingsForm';
import { generateId } from '@/lib/conversation-utils';
import { sendChatRequest } from '@/utils/api';

export function useMessageGeneration() {
  const sendMessageToAPI = async (
    userMessage: string,
    model: string,
    settings: any,
    sessionId: string,
    images?: File[],
    updateStreamingContent?: (content: string) => void,
    isPrimary: boolean = true
  ): Promise<string> => {
    try {
      console.log(`Sending chat request with message to model ${model} (${isPrimary ? 'primary' : 'secondary'}):`, userMessage);
      
      const response = await sendChatRequest({
        query: userMessage,
        images,
        sessionId,
        settings,
        isPrimary,
        modelOverride: model
      });

      if (!response.ok) {
        throw new Error(`Failed to get response from API: ${response.status} ${response.statusText}`);
      }

      // Get reader from response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      console.log(`Got reader for ${model}, starting to read chunks`);
      let accumulatedContent = '';
      const decoder = new TextDecoder();
      
      // Read the stream
      let isFirstChunk = true;
      
      while (true) {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log(`Stream for ${model} finished`);
            break;
          }
          
          // Convert the Uint8Array to string
          const chunk = decoder.decode(value, { stream: true });
          
          if (chunk.length > 0) {
            console.log(`Received chunk for ${model} (${chunk.length} bytes): "${chunk.substring(0, 50)}${chunk.length > 50 ? '...' : ''}"`);
            
            // For debugging - log the byte data
            if (isFirstChunk) {
              console.log(`First chunk bytes for ${model}:`, Array.from(value).slice(0, 20));
              isFirstChunk = false;
            }
            
            accumulatedContent += chunk;
            
            // Update UI with each chunk
            if (updateStreamingContent) {
              updateStreamingContent(accumulatedContent);
            }
          } else {
            console.log(`Received empty chunk for ${model}`);
          }
        } catch (error) {
          console.error(`Error reading stream chunk for ${model}:`, error);
          throw error;
        }
      }
      
      // Final flush with end of stream flag
      const finalFlush = decoder.decode();
      if (finalFlush) {
        accumulatedContent += finalFlush;
        if (updateStreamingContent) {
          updateStreamingContent(accumulatedContent);
        }
      }

      console.log(`Final result for ${model} (first 100 chars):`, accumulatedContent.substring(0, 100) + (accumulatedContent.length > 100 ? '...' : ''));
      return accumulatedContent;
    } catch (error) {
      console.error(`Error in API call for ${model}:`, error);
      throw error;
    }
  };

  const createUserMessage = (content: string, imageIds?: string[]): Message => {
    // Make sure we're creating a valid user message with proper typing
    console.log("Creating user message with content:", content);
    const message: Message = {
      id: generateId(),
      role: "user" as const,
      content,
      timestamp: Date.now(),
      status: "sent",
      ...(imageIds && imageIds.length > 0 ? { imageIds } : {})
    };
    console.log("Created user message:", message);
    return message;
  };

  const createAssistantMessage = (
    content: string, 
    modelName: string, 
    modelSettings: ModelSettings
  ): Message => {
    const timestamp = Date.now();
    
    // Create proper model-specific message with DeepSeek property set
    if (isGptModel(modelName)) {
      return {
        id: generateId(),
        role: "assistant" as const,
        content,
        timestamp,
        modelName,
        temperature: modelSettings.temperature,
        maxTokens: modelSettings.max_tokens,
        useDeepSeek: modelSettings.use_deepseek,
        status: "sent"
      };
    } else {
      return {
        id: generateId(),
        role: "assistant" as const,
        content,
        timestamp,
        modelName,
        reasoningEffort: modelSettings.reasoningEffort,
        status: "sent"
      };
    }
  };

  return {
    sendMessageToAPI,
    createUserMessage,
    createAssistantMessage
  };
}
