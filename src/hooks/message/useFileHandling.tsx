
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useFileHandling() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      const isUnderLimit = file.size <= 4 * 1024 * 1024; // 4MB
      
      if (!isImage || !isJpgOrPng) {
        toast({
          title: "Invalid file type",
          description: "Only JPG and PNG images are supported",
          variant: "destructive"
        });
        return false;
      }
      
      if (!isUnderLimit) {
        toast({
          title: "File too large",
          description: "Images must be under 4MB",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    if (selectedFiles.length + validFiles.length > 4) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 4 images",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const filesToDataURLs = async (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const getImage = (id: string) => {
    const imageUrl = localStorage.getItem(`image-${id}`);
    return imageUrl || null;
  };

  return {
    selectedFiles,
    setSelectedFiles,
    imageUrls,
    setImageUrls,
    fileInputRef,
    handleFileChange,
    filesToDataURLs,
    getImage
  };
}
