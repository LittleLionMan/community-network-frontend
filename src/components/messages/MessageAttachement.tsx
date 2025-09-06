import React, { useState } from 'react';
import { Upload, File, Image, X, Download } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface MessageAttachmentProps {
  onAttachmentSend: (file: File) => Promise<void>;
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({
  onAttachmentSend,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      alert('Datei ist zu groß. Maximum: 10MB');
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Dateityp nicht unterstützt');
      return;
    }

    setIsUploading(true);
    try {
      await onAttachmentSend(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      <label
        htmlFor="file-upload"
        className={`flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
            <span className="text-sm text-gray-600">Upload läuft...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-600">
            <Upload className="h-5 w-5" />
            <span className="text-sm">Datei auswählen oder hierher ziehen</span>
          </div>
        )}
      </label>
    </div>
  );
};
