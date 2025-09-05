'use client';

import { toast as sonnerToast, Toaster } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      duration: 6000,
    });
  },
};

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
      closeButton
      richColors
    />
  );
}
