
import { SettingsFormValues } from "@/types";

// API base URL - update this to your local backend URL when developing locally
const API_BASE_URL = 'http://localhost:8000';

// Log the API base URL
console.log('Using API base URL:', API_BASE_URL);

// Helper function to get API keys from localStorage
const getApiKeys = () => {
  const storageOpenAIKey = localStorage.getItem('OPENAI_API_KEY');
  const storageDeepSeekKey = localStorage.getItem('DEEPSEEK_API_KEY');
  
  return {
    openaiApiKey: storageOpenAIKey || '',
    deepseekApiKey: storageDeepSeekKey || ''
  };
};

// Helper function to validate API keys
export const validateApiKeys = (useDeepSeek: boolean = false) => {
  const { openaiApiKey, deepseekApiKey } = getApiKeys();
  
  if (!openaiApiKey) {
    return {
      isValid: false,
      errorMessage: "OpenAI API key is required. Please set it in the Configuration page."
    };
  }
  
  if (useDeepSeek && !deepseekApiKey) {
    return {
      isValid: false,
      errorMessage: "DeepSeek API key is missing. Please set it in the Configuration page to use DeepSeek reasoning features."
    };
  }
  
  return { isValid: true, errorMessage: null };
};

interface ChatRequestParams {
  query: string;
  images?: File[];
  sessionId: string;
  settings: SettingsFormValues;
  isPrimary?: boolean;
  modelOverride?: string;
}

export const sendChatRequest = async (params: ChatRequestParams) => {
  const { query, images = [], sessionId, settings, isPrimary = true, modelOverride } = params;
  
  // Determine which model settings to use based on whether it's primary or secondary
  const modelSettings = isPrimary ? settings.primaryModelSettings : settings.secondaryModelSettings;
  
  // Validate API keys
  const useDeepSeek = modelSettings?.use_deepseek || false;
  const validation = validateApiKeys(useDeepSeek);
  
  if (!validation.isValid) {
    throw new Error(validation.errorMessage);
  }
  
  // Get API keys
  const { openaiApiKey, deepseekApiKey } = getApiKeys();
  
  console.log(`Preparing chat request for session ${sessionId} with query: ${query.substring(0, 30)}...`);
  console.log(`Image count: ${images.length}`);
  
  // Create FormData
  const formData = new FormData();
  formData.append('query', query);
  
  // Use model override if provided, otherwise use the appropriate model from settings
  const model = modelOverride || (isPrimary ? settings.model : settings.compareModel);
  formData.append('model', model);
  formData.append('session_id', sessionId);
  
  // Convert memory setting to expected format
  let memoryPairs = '0';
  switch (settings.conversation_memory) {
    case 'last_5': memoryPairs = '5'; break;
    case 'last_10': memoryPairs = '10'; break;
    case 'last_15': memoryPairs = '15'; break;
    default: memoryPairs = '0'; // For 'all' or 'none'
  }
  formData.append('memory_pairs', memoryPairs);

  // Add model settings - use correct settings based on primary/secondary
  console.log(`[Debug] API Request Settings for ${isPrimary ? 'Primary' : 'Secondary'} Model:`, {
    model,
    isPrimary,
    modelSettings,
    willUseDeepSeek: modelSettings?.use_deepseek || false
  });

  // Only send settings if they exist
  if (modelSettings) {
    formData.append('temperature', (modelSettings.temperature || 0.7).toString());
    formData.append('max_completion_tokens', (modelSettings.max_tokens || 16384).toString());
    
    // Only enable deep seek reasoning if explicitly enabled for this model
    const useDeepSeek = modelSettings.use_deepseek || false;
    formData.append('use_v3_reasoning', useDeepSeek.toString());
    
    // Only send reasoning effort if deep seek is enabled
    if (useDeepSeek) {
      formData.append('reasoning_effort', modelSettings.reasoningEffort || 'medium');
    }
  } else {
    console.warn(`No model settings found for ${isPrimary ? 'primary' : 'secondary'} model`);
    // Use defaults
    formData.append('temperature', '0.7');
    formData.append('max_completion_tokens', '16384');
    formData.append('use_v3_reasoning', 'false');
  }

  // Append images if any
  if (images && images.length > 0) {
    console.log(`Appending ${images.length} images to request`);
    images.forEach((image, index) => {
      formData.append('images', image);
      console.log(`Added image ${index + 1}: ${image.name}, type: ${image.type}, size: ${image.size} bytes`);
    });
  }

  // Log the entire request payload for debugging
  console.log('FormData payload keys:', [...formData.keys()]);
  console.log('FormData payload values (excluding binary):', [...formData.keys()].reduce((acc, key) => {
    if (key !== 'images') {
      acc[key] = formData.get(key);
    } else {
      acc[key] = `${formData.getAll('images').length} files`;
    }
    return acc;
  }, {} as Record<string, any>));

  try {
    console.log(`Sending request to ${API_BASE_URL}/chat with sessionId: ${sessionId}, model: ${model}`);
    
    // Always ensure stream=true to force streaming mode
    const url = new URL(`${API_BASE_URL}/chat`);
    url.searchParams.append('stream', 'true');
    
    console.log('Sending request with stream=true explicitly set');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': openaiApiKey,
        'deepseek-api-key': deepseekApiKey,
        'Accept': 'text/event-stream',
      },
      body: formData,
    });

    // Log detailed response information for debugging
    console.log(`API response received. Status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, {
      'content-type': response.headers.get('content-type'),
      'transfer-encoding': response.headers.get('transfer-encoding'),
      'connection': response.headers.get('connection'),
      'cache-control': response.headers.get('cache-control')
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // Verify we got a streaming response
    const isStreaming = response.headers.get('content-type')?.includes('text/event-stream') || 
                        response.headers.get('transfer-encoding')?.includes('chunked');
    
    console.log(`Is streaming response: ${isStreaming ? 'Yes' : 'No'}`);
    
    return response;

  } catch (error) {
    console.error('Error sending chat request:', error);
    throw error;
  }
};

export const resetSession = async (sessionId: string) => {
  try {
    console.log(`Resetting session with ID: ${sessionId}`);
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      console.error(`Reset session error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to reset session: ${response.status}`);
    }

    console.log('Session reset successful');
    return await response.json();
  } catch (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
};
