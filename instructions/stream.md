# Streaming Implementation Guide

This guide explains how the real-time streaming functionality is implemented in the chat application.

## Table of Contents
- [Overview](#overview)
- [Key Components](#key-components)
- [Implementation Details](#implementation-details)
- [Usage Guide](#usage-guide)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

The chat application uses the Fetch API's streaming capabilities and ReadableStream interface to implement real-time streaming of AI responses. This creates a smooth, interactive experience where responses appear gradually on the screen as they're generated.

## Key Components

### Message Interface
```typescript
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status: MessageStatus; // "streaming" | "sent" | "error"
  useDeepSeek?: boolean;
  reasoningTime?: number;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: string;
}
```

### API Service Configuration
```typescript
interface SendMessageParams {
  input: string;
  model: string;
  sessionId: string;
  formValues: FormValues;
  selectedFiles: File[];
  setIsWaiting: (value: boolean) => void;
  setMessagesFn: React.Dispatch<React.SetStateAction<Message[]>>;
  updatedMsgs: Message[];
}
```

## Implementation Details

### 1. Stream Initialization

```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let accumulatedContent = "";
let firstChunkReceived = false;

const startTime = Date.now();
const assistantMessage: Message = {
  id: (Date.now() + 1).toString(),
  content: "",
  role: "assistant",
  timestamp: new Date(),
  status: "streaming",
  // ... other properties
};
```

### 2. Stream Processing

```typescript
while (true) {
  const { done, value } = await reader.read();
  
  if (done) {
    assistantMessage.status = "sent";
    break;
  }

  const chunk = decoder.decode(value);
  accumulatedContent += chunk;

  // Update UI with new content
  setMessagesFn(prev =>
    prev.map(msg =>
      msg.id === assistantMessage.id
        ? {
            ...assistantMessage,
            content: accumulatedContent,
            reasoningTime: Math.floor((Date.now() - startTime) / 1000)
          }
        : msg
    )
  );
}
```

## Usage Guide

### Basic Usage

```typescript
const response = await sendMessageToApi({
  input: userMessage,
  model: selectedModel,
  sessionId: currentSession,
  formValues: settings,
  selectedFiles: [],
  setIsWaiting: setWaitingState,
  setMessagesFn: setMessages,
  updatedMsgs: currentMessages
});
```

### Required API Keys

- OpenAI API key for GPT-4 models
- DeepSeek API key when use_deepseek is enabled

```typescript
const headers: HeadersInit = {
  accept: "application/json",
  ...(formValues.openai_key ? { "api-key": formValues.openai_key } : {}),
  ...(use_deepseek && formValues.deepseek_key ? { "deepseek-api-key": formValues.deepseek_key } : {})
};
```

## Error Handling

### Timeout Management
```typescript
const timeoutDuration = use_deepseek ? 600000 : 60000;  // 600s for DeepSeek, 60s for others
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
```

### Stream Error Handling
```typescript
try {
  // Stream processing
} catch (error) {
  console.error("Stream reading error:", error);
  setMessagesFn(prev => [
    ...prev,
    {
      ...assistantMessage,
      content: "Error: Failed to read response stream. Please try again.",
      status: "error"
    }
  ]);
  throw error;
}
```

## Best Practices

1. **API Key Validation**
   - Validate required API keys before making requests
   - Handle missing API key errors gracefully

2. **Resource Management**
   - Clear timeouts when stream completes
   - Properly handle stream reader cleanup
   - Use appropriate timeout durations for different models

3. **UI Updates**
   - Show loading states during initialization
   - Provide visual feedback for streaming status
   - Display error messages clearly to users

4. **Performance**
   - Track and display reasoning time
   - Handle large responses efficiently
   - Implement proper error boundaries

## Features

- Real-time message streaming
- Progress tracking with reasoning time
- Robust error handling
- Model-specific timeout management
- Status indicators (streaming/sent/error)
- Support for multiple AI models
- File upload capabilities
- Customizable model settings

## Security Considerations

1. Never expose API keys in client-side code
2. Implement proper request validation
3. Use secure headers for API requests
4. Handle sensitive data appropriately
5. Implement rate limiting where necessary
