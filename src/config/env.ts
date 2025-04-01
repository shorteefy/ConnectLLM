
// This file is kept for compatibility but no longer uses environment variables
// All API keys are now managed through the Configuration page and stored in localStorage

// Log configuration info
console.log('API Keys Source: Keys must be provided by the user in the configuration page');

// Dispatch an event when settings change
export const notifySettingsChanged = () => {
  window.dispatchEvent(new CustomEvent('settingsChanged'));
  console.log('Dispatched settingsChanged event');
};
