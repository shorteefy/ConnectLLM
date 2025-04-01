
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModelSelectionSection from './settings/ModelSelectionSection';
import ModelParametersSection from './settings/ModelParametersSection';
import MemorySettingsSection from './settings/MemorySettingsSection';

interface SettingsSheetProps {
  form: any;
  saveSettings: (values: any) => void;
  onSubmit?: (values: any) => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ form, saveSettings, onSubmit }) => {
  const { toast } = useToast();
  const primaryModel = form.watch("model");
  const secondaryModel = form.watch("compareModel");
  const showSplitView = form.watch("isSplitView");

  // Watch for form changes and auto-save
  useEffect(() => {
    const subscription = form.watch((value: any) => {
      // Auto-save settings when form values change
      saveSettings(value);
    });
    
    return () => subscription.unsubscribe();
  }, [form, saveSettings]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-4 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">Settings</SheetTitle>
          <SheetDescription>
            Configure your chat experience
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form className="space-y-5 py-2" onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
            <ModelSelectionSection form={form} showSplitView={showSplitView} />
            <ModelParametersSection 
              form={form} 
              primaryModel={primaryModel} 
              secondaryModel={secondaryModel} 
              showSplitView={showSplitView} 
            />
            <MemorySettingsSection form={form} />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
