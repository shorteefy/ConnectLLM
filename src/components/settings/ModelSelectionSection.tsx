
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

interface ModelSelectionSectionProps {
  form: any;
  showSplitView: boolean;
}

const ModelSelectionSection: React.FC<ModelSelectionSectionProps> = ({ form, showSplitView }) => {
  return (
    <Card className="p-4 space-y-4 shadow-sm border-purple-100 dark:border-purple-900/20">
      <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-300">Model Selection</h3>
      
      {/* Provider */}
      <FormField
        control={form.control}
        name="provider"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium text-sm text-gray-700 dark:text-gray-300">Provider</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || "openai"}
            >
              <FormControl>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {/* Primary and Secondary Models */}
      <div className={`grid ${showSplitView ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm text-gray-700 dark:text-gray-300">
                {showSplitView ? 'Primary Model' : 'Model'}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                  <SelectItem value="o1">o1</SelectItem>
                  <SelectItem value="o3-mini">o3-mini</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        {/* Compare Model (only shown if split view is enabled) */}
        {showSplitView && (
          <FormField
            control={form.control}
            name="compareModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-sm text-gray-700 dark:text-gray-300">Compare Model</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                    <SelectItem value="o1">o1</SelectItem>
                    <SelectItem value="o3-mini">o3-mini</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
      </div>
      
      {/* Split View Mode */}
      <FormField
        control={form.control}
        name="isSplitView"
        render={({ field }) => (
          <FormItem className="p-3 border border-purple-100 dark:border-purple-900/30 rounded-md bg-purple-50/50 dark:bg-purple-900/10 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <FormLabel className="text-base mb-0.5 font-medium text-purple-800 dark:text-purple-300">Split View Mode</FormLabel>
                <FormDescription className="text-xs max-w-[230px] leading-relaxed">
                  Compare responses from two models side by side
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-purple-600"
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </Card>
  );
};

export default ModelSelectionSection;
