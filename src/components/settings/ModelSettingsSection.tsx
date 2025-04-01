
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ModelSettingsSectionProps {
  form: any;
  modelType: string;
  settingsPath: string;
}

const ModelSettingsSection: React.FC<ModelSettingsSectionProps> = ({ 
  form, 
  modelType, 
  settingsPath 
}) => {
  const isGptModel = modelType.startsWith('gpt');

  if (isGptModel) {
    return (
      <div className="space-y-5">
        {/* Temperature */}
        <FormField
          control={form.control}
          name={`${settingsPath}.temperature`}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</FormLabel>
                <span className="text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md font-medium">{field.value}</span>
              </div>
              <FormControl>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  defaultValue={[field.value || 0.7]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  className="py-1"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                Higher values produce more varied outputs (0-2)
              </FormDescription>
            </FormItem>
          )}
        />
        
        {/* Max Tokens */}
        <FormField
          control={form.control}
          name={`${settingsPath}.max_tokens`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Tokens</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  value={field.value || 16384} 
                  onChange={field.onChange}
                  className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  max={16384}
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum length of generated response (up to 16384)
              </FormDescription>
            </FormItem>
          )}
        />
        
        {/* DeepSeek Integration */}
        <FormField
          control={form.control}
          name={`${settingsPath}.use_deepseek`}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 py-2 px-3 border border-purple-100 dark:border-purple-900/30 rounded-md bg-purple-50/50 dark:bg-purple-900/10 shadow-sm">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-purple-600"
                />
              </FormControl>
              <div>
                <FormLabel className="text-sm font-medium mb-0.5 text-purple-800 dark:text-purple-300">DeepSeek Reasoner</FormLabel>
                <FormDescription className="text-xs text-gray-600 dark:text-gray-400">
                  Enable advanced reasoning capabilities
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    );
  } else {
    return (
      <div className="space-y-5">
        {/* Reasoning Effort */}
        <FormField
          control={form.control}
          name={`${settingsPath}.reasoningEffort`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Reasoning Effort</FormLabel>
              <FormControl>
                <ToggleGroup 
                  type="single" 
                  value={field.value || "medium"} 
                  onValueChange={(value) => {
                    if (value) field.onChange(value);
                  }}
                  className="justify-start bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-1 w-full"
                >
                  <ToggleGroupItem value="low" className="flex-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-800 dark:data-[state=on]:bg-purple-900/30 dark:data-[state=on]:text-purple-300">Low</ToggleGroupItem>
                  <ToggleGroupItem value="medium" className="flex-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-800 dark:data-[state=on]:bg-purple-900/30 dark:data-[state=on]:text-purple-300">Medium</ToggleGroupItem>
                  <ToggleGroupItem value="high" className="flex-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-800 dark:data-[state=on]:bg-purple-900/30 dark:data-[state=on]:text-purple-300">High</ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Controls how much effort the model spends on reasoning
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    );
  }
};

export default ModelSettingsSection;
