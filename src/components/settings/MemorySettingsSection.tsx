
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface MemorySettingsSectionProps {
  form: any;
}

const MemorySettingsSection: React.FC<MemorySettingsSectionProps> = ({ form }) => {
  return (
    <Card className="p-4 space-y-4 shadow-sm border-purple-100 dark:border-purple-900/20">
      <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-300">Memory Settings</h3>
      
      {/* Conversation Memory */}
      <FormField
        control={form.control}
        name="conversation_memory"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium text-sm text-gray-700 dark:text-gray-300">Conversation Memory</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || "last_10"}
            >
              <FormControl>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select memory range" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="last_10">Last 10 messages</SelectItem>
                <SelectItem value="last_20">Last 20 messages</SelectItem>
                <SelectItem value="last_50">Last 50 messages</SelectItem>
                <SelectItem value="all">All messages</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              Number of previous messages to include in conversation context
            </FormDescription>
          </FormItem>
        )}
      />
    </Card>
  );
};

export default MemorySettingsSection;
