'use client'

import { toast as sonnerToast, Toaster } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

export const toast = {
  success: (message: string) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle className="w-4 h-4" />,
    })
  },
  error: (message: string) => {
    return sonnerToast.error(message, {
      icon: <XCircle className="w-4 h-4" />,
    })
  },
}

export function ToastProvider() {
  return <Toaster position="bottom-right" richColors />
}
