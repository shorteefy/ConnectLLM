
import React from 'react';
import FilePreview from './input/FilePreview';
import ImageUploadButton from './input/ImageUploadButton';
import MessageInput from './input/MessageInput';
import SendButton from './input/SendButton';
import { shouldEnableImageUpload, getModelDisplayName } from './input/utils';

interface InputAreaProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isWaiting: boolean;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  form: any;
}

const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  handleSend,
  isWaiting,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  handleFileChange,
  form
}) => {
  const handleSendWrapper = () => {
    if (isWaiting) return;
    
    // Only send if there's text or files
    if (input.trim() || selectedFiles.length > 0) {
      handleSend();
    }
  };
  
  // Determine if image upload should be enabled
  const enableImageUpload = shouldEnableImageUpload(form);
  
  // Get the model name with DeepSeek suffix if applicable
  const modelDisplayName = getModelDisplayName(form);

  return (
    <div className="border-t p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        {/* Selected file previews */}
        <FilePreview 
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
        
        {/* Input row */}
        <div className="flex space-x-2">
          {/* Image upload button */}
          <div className="flex items-center" data-enabled={enableImageUpload.toString()}>
            <ImageUploadButton
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              isWaiting={isWaiting}
              selectedFilesCount={selectedFiles.length}
              isEnabled={enableImageUpload}
            />
          </div>
          
          {/* Textarea */}
          <MessageInput
            input={input}
            setInput={setInput}
            isWaiting={isWaiting}
            handleSend={handleSendWrapper}
            hasSelectedFiles={selectedFiles.length > 0}
          />
          
          {/* Send button */}
          <SendButton
            handleSend={handleSendWrapper}
            isWaiting={isWaiting}
            hasContent={input.trim().length > 0 || selectedFiles.length > 0}
            isSplitView={form.watch('isSplitView')}
            modelName={modelDisplayName}
          />
        </div>
      </div>
    </div>
  );
};

export default InputArea;
