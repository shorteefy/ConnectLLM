
/**
 * Determines if image upload should be enabled based on current model settings
 */
export function shouldEnableImageUpload(form: any): boolean {
  const primaryModel = form.watch("model");
  const secondaryModel = form.watch("compareModel");
  const isSplitView = form.watch("isSplitView");
  const primaryUseDeepSeek = form.watch('primaryModelSettings.use_deepseek');
  const secondaryUseDeepSeek = form.watch('secondaryModelSettings.use_deepseek');
  
  // Get the appropriate deep seek setting based on the model
  const useDeepSeek = isSplitView ? 
    (primaryUseDeepSeek || secondaryUseDeepSeek) : // If either model has deep seek enabled in split view
    primaryUseDeepSeek; // Only consider primary model in single view
  
  // If using DeepSeek, disable image upload
  if (useDeepSeek) return false;
  
  // If o3-mini is selected in either model position in split view, disable image upload
  if (isSplitView && (primaryModel === "o3-mini" || secondaryModel === "o3-mini")) {
    return false;
  }
  
  // If single model view and using o3-mini, disable image upload
  if (!isSplitView && primaryModel === "o3-mini") {
    return false;
  }
  
  // Only allow image upload for supported models
  return (primaryModel === "gpt-4o" || 
          primaryModel === "gpt-4o-mini" || 
          primaryModel === "o1");
}

/**
 * Gets the model display name with DeepSeek suffix if applicable
 */
export function getModelDisplayName(form: any): string {
  const model = form.watch("model");
  const useDeepSeek = form.watch("primaryModelSettings.use_deepseek");
  
  if (useDeepSeek && (model === "gpt-4o" || model === "gpt-4o-mini")) {
    return `${model} + DeepSeek`;
  }
  
  return model;
}
