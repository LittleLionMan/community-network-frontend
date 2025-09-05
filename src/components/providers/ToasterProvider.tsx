'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
        },
      }}
    />
  );
}
