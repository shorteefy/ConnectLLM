
import React from 'react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import ModelSettingsSection from './ModelSettingsSection';
import { Card } from '@/components/ui/card';

interface ModelParametersSectionProps {
  form: any;
  primaryModel: string;
  secondaryModel: string;
  showSplitView: boolean;
}

const ModelParametersSection: React.FC<ModelParametersSectionProps> = ({ 
  form, 
  primaryModel, 
  secondaryModel,
  showSplitView 
}) => {
  const getModelDisplayName = (model: string) => {
    switch(model) {
      case "gpt-4o": return "gpt-4o";
      case "gpt-4o-mini": return "gpt-4o-mini";
      case "o1": return "o1";
      case "o3-mini": return "o3-mini";
      default: return model;
    }
  };

  return (
    <Card className="p-4 space-y-4 shadow-sm border-purple-100 dark:border-purple-900/20">
      <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-300">Model Parameters</h3>
      
      {showSplitView ? (
        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-purple-100/50 dark:bg-purple-900/10">
            <TabsTrigger value="primary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-800 dark:data-[state=active]:text-purple-300">
              Primary Model
            </TabsTrigger>
            <TabsTrigger value="secondary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-800 dark:data-[state=active]:text-purple-300">
              Secondary Model
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="primary" className="space-y-4 pt-4">
            <ModelSettingsSection 
              form={form} 
              modelType={primaryModel} 
              settingsPath="primaryModelSettings" 
            />
          </TabsContent>
          
          <TabsContent value="secondary" className="space-y-4 pt-4">
            <ModelSettingsSection 
              form={form} 
              modelType={secondaryModel} 
              settingsPath="secondaryModelSettings" 
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <ModelSettingsSection 
            form={form} 
            modelType={primaryModel} 
            settingsPath="primaryModelSettings" 
          />
        </div>
      )}
    </Card>
  );
};

export default ModelParametersSection;
