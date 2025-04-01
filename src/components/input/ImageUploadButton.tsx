
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploadButtonProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isWaiting: boolean;
  selectedFilesCount: number;
  isEnabled: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  fileInputRef,
  handleFileChange,
  isWaiting,
  selectedFilesCount,
  isEnabled
}) => {
  if (!isEnabled) return null;
  
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={isWaiting}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 sm:h-10 sm:w-10"
        onClick={() => fileInputRef.current?.click()}
        disabled={selectedFilesCount >= 4 || isWaiting}
        title="Attach images"
      >
        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </>
  );
};

export default ImageUploadButton;
