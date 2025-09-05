'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ProfileImageUploadProps {
  currentUser: {
    id: number;
    display_name: string;
    profile_image_url?: string | null;
  };
  onImageUpdate: (imageUrl: string | null) => void;
  isLoading?: boolean;
}

export function ProfileImageUpload({
  currentUser,
  onImageUpdate,
  isLoading,
}: ProfileImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Nur Bilddateien sind erlaubt';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Bild ist zu groß (max. 5MB)';
    }

    return null;
  };

  const uploadImage = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await apiClient.users.uploadProfileImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onImageUpdate(result.profile_image_url);

      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setError(
        error instanceof Error ? error.message : 'Upload fehlgeschlagen'
      );
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = async () => {
    if (!currentUser.profile_image_url) return;

    setIsUploading(true);
    try {
      await apiClient.users.deleteProfileImage();
      onImageUpdate(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Löschen fehlgeschlagen'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    return currentUser.display_name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="group relative">
        <div
          className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg transition-all duration-200 ${
            isDragging ? 'scale-105 border-indigo-400' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {currentUser.profile_image_url ? (
            <img
              src={currentUser.profile_image_url}
              alt={`${currentUser.display_name} Profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600">
              <span className="text-2xl font-bold text-white">
                {getInitials()}
              </span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
              <div className="text-center">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                <div className="text-xs text-white">{uploadProgress}%</div>
              </div>
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed border-indigo-400 bg-indigo-500 bg-opacity-20">
              <Upload className="h-8 w-8 text-indigo-600" />
            </div>
          )}
        </div>

        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-3 text-white shadow-lg transition-colors hover:bg-indigo-700"
            disabled={isLoading}
          >
            <Camera className="h-5 w-5" />
          </button>
        )}

        {currentUser.profile_image_url && !isUploading && (
          <button
            onClick={removeImage}
            className="absolute right-0 top-0 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || isLoading}
      />

      <div className="text-center">
        <p className="mb-2 text-sm text-gray-600">
          Klicken Sie auf das Kamera-Symbol oder ziehen Sie ein Bild hierher
        </p>
        <p className="text-xs text-gray-500">Max. 5MB • JPG, PNG, GIF</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {uploadProgress === 100 && !error && (
        <div className="flex items-center rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <Check className="mr-2 h-4 w-4" />
          Profilbild erfolgreich aktualisiert
        </div>
      )}
    </div>
  );
}
