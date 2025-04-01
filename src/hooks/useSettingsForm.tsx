
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { SettingsFormValues, ModelSettings } from "@/types";

// Default settings
const defaultSettings: SettingsFormValues = {
  provider: "openai",
  model: "gpt-4o-mini",
  compareModel: "gpt-4o",
  primaryModelSettings: {
    temperature: 0.7,
    max_tokens: 16384,
    use_deepseek: false
  },
  secondaryModelSettings: {
    temperature: 0.7,
    max_tokens: 16384,
    use_deepseek: false,
    reasoningEffort: "medium"
  },
  isSplitView: false,
  conversation_memory: "last_10"
};

// Helper to determine if a model is from OpenAI (GPT) or Anthropic (Claude)
export const isGptModel = (model: string) => {
  return model.startsWith("gpt");
};

// Helper to get default model settings based on model type
export const getDefaultModelSettings = (model: string): ModelSettings => {
  if (isGptModel(model)) {
    return {
      temperature: 0.7,
      max_tokens: 16384,
      use_deepseek: false
    };
  } else {
    return {
      reasoningEffort: "medium"
    };
  }
};

export function useSettingsForm() {
  // Initialize form with default values
  const form = useForm<SettingsFormValues>({
    defaultValues: defaultSettings
  });

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as Partial<SettingsFormValues>;
        
        // Apply saved settings
        form.reset({
          ...defaultSettings,
          ...parsedSettings
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // If there's an error, fall back to defaults
      form.reset(defaultSettings);
    }
  }, [form]);

  // Watch for split view changes and trigger refresh
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // When split view changes, dispatch custom event to trigger UI refresh
      if (name === 'isSplitView') {
        // Create a custom event to notify components about split view change
        const event = new CustomEvent('splitViewChanged', { 
          detail: { 
            isSplitView: value.isSplitView,
            previousValue: !value.isSplitView 
          } 
        });
        window.dispatchEvent(event);
        console.log(`Split view mode changed to: ${value.isSplitView}`);
      }
      
      // When primary model changes, update primary model settings
      if (name === 'model') {
        const model = value.model as string;
        form.setValue('primaryModelSettings', {
          ...form.getValues('primaryModelSettings'),
          ...getDefaultModelSettings(model)
        });
      }
      
      // When compare model changes, update secondary model settings
      if (name === 'compareModel') {
        const model = value.compareModel as string;
        form.setValue('secondaryModelSettings', {
          ...form.getValues('secondaryModelSettings'),
          ...getDefaultModelSettings(model)
        });
      }
    });
    
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [form]);

  // Save settings to localStorage whenever they change
  const saveSettings = (values: SettingsFormValues) => {
    localStorage.setItem('settings', JSON.stringify(values));
  };

  return {
    form,
    saveSettings,
    isGptModel
  };
}
