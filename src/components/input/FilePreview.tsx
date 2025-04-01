
import React from 'react';

interface FilePreviewProps {
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  selectedFiles, 
  setSelectedFiles 
}) => {
  if (selectedFiles.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2">
      {selectedFiles.map((file, index) => (
        <div key={index} className="relative group">
          <img 
            src={URL.createObjectURL(file)} 
            alt={`Selected file ${index + 1}`}
            className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md border shadow-sm"
          />
          <button
            type="button"
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            onClick={() => {
              const newFiles = [...selectedFiles];
              newFiles.splice(index, 1);
              setSelectedFiles(newFiles);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
