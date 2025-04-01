
export interface ModelSettings {
  // OpenAI specific settings
  temperature?: number;
  max_tokens?: number;
  use_deepseek?: boolean;
  
  // Anthropic specific settings
  reasoningEffort?: "low" | "medium" | "high";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  imageIds?: string[];
  status?: "sending" | "sent" | "error";
  modelName?: string;
  reasoningTime?: number;
  useDeepSeek?: boolean;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
  compareMessages?: Message[];
  isArchived?: boolean;
  primarySessionId?: string;
  secondarySessionId?: string;
  model?: string;
  compareModel?: string;
  isSplitView?: boolean;
  primaryModelSettings?: ModelSettings;
  secondaryModelSettings?: ModelSettings;
}

export interface SettingsFormValues {
  provider: string;
  model: string;
  compareModel: string;
  primaryModelSettings: ModelSettings;
  secondaryModelSettings: ModelSettings;
  isSplitView: boolean;
  conversation_memory: string;
}
