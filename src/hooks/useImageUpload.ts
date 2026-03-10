import { useState, useCallback } from 'react';
import { compressImage } from '../utils/imageCompression';

interface UseImageUploadReturn {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCoverImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => Promise<string | null>;
  removeImage: (index: number) => void;
  isUploading: boolean;
}

export const useImageUpload = (initialImages: string[] = []): UseImageUploadReturn => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      const fileArray = Array.from(files);
      try {
        const compressedImages = await Promise.all(
          fileArray.map((file) => compressImage(file)) // Use defaults (600px, 0.5 quality)
        );
        setImages((prev) => [...prev, ...compressedImages]);
      } catch (error) {
        console.error('Error compressing images:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }, []);

  const handleCoverImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const compressedDataUrl = await compressImage(file); // Use defaults
          onSuccess(compressedDataUrl);
          return compressedDataUrl;
        } catch (error) {
          console.error('Error compressing cover image:', error);
          return null;
        } finally {
          setIsUploading(false);
        }
      }
      return null;
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    images,
    setImages,
    handleImageUpload,
    handleCoverImageUpload,
    removeImage,
    isUploading,
  };
};
