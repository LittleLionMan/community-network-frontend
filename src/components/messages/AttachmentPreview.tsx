import React from 'react';
import Image from 'next/image';
import { File, Download, X } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: () => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onRemove,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = attachment.type.startsWith('image/');

  return (
    <div className="flex items-center space-x-3 rounded-lg border p-3">
      <div className="flex-shrink-0">
        {isImage ? (
          <div className="relative">
            <Image
              src={attachment.url}
              alt={attachment.name}
              fill
              className="rounded object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
            <File className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900">
          {attachment.name}
        </div>
        <div className="text-xs text-gray-500">
          {formatFileSize(attachment.size)}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <a
          href={attachment.url}
          download={attachment.name}
          className="rounded p-1 text-gray-400 hover:text-gray-600"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </a>
        {onRemove && (
          <button
            onClick={onRemove}
            className="rounded p-1 text-gray-400 hover:text-red-600"
            title="Entfernen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
