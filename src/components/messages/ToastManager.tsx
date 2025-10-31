'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Shield,
  WifiOff,
  XCircle,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import type { WebSocketAuthError } from '@/types/websocket';

export type ToastPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ToastMessage {
  id: string;
  type:
    | 'auth'
    | 'security'
    | 'network'
    | 'error'
    | 'warning'
    | 'success'
    | 'info';
  priority: ToastPriority;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  duration?: number;
}

interface ToastManagerProps {
  authError?: WebSocketAuthError | null;
  securityBlock?: {
    isBlocked: boolean;
    reason: string | null;
  };
  offlineQueueLength?: number;
  errors?: Array<{
    id: string;
    message: string;
    severity: 'high' | 'medium' | 'low' | 'critical';
    retryable?: boolean;
  }>;
  onAuthRetry?: () => void;
  onSecurityClear?: () => void;
  onErrorRetry?: (errorId: string) => void;
  onErrorDismiss?: (errorId: string) => void;
}

const priorityOrder: Record<ToastPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const getDuration = (priority: ToastPriority): number => {
  switch (priority) {
    case 'critical':
      return Infinity;
    case 'high':
      return 10000;
    case 'medium':
      return 6000;
    case 'low':
      return 4000;
  }
};

const getIcon = (type: ToastMessage['type']) => {
  switch (type) {
    case 'auth':
      return <AlertTriangle className="h-5 w-5" />;
    case 'security':
      return <Shield className="h-5 w-5" />;
    case 'network':
      return <WifiOff className="h-5 w-5" />;
    case 'error':
      return <XCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5" />;
    case 'success':
      return <CheckCircle className="h-5 w-5" />;
    case 'info':
      return <Info className="h-5 w-5" />;
  }
};

export const ToastManager: React.FC<ToastManagerProps> = ({
  authError,
  securityBlock,
  offlineQueueLength = 0,
  errors = [],
  onAuthRetry,
  onSecurityClear,
  onErrorRetry,
}) => {
  const activeToastsRef = useRef<Set<string>>(new Set());
  const toastIdsRef = useRef<Map<string, string | number>>(new Map());

  const generateToasts = (): ToastMessage[] => {
    const toasts: ToastMessage[] = [];

    if (authError) {
      const priority: ToastPriority =
        authError.severity === 'high' ? 'critical' : 'high';
      toasts.push({
        id: `auth-${authError.type}`,
        type: 'auth',
        priority,
        title: getAuthErrorTitle(authError.type),
        message: authError.message,
        action:
          authError.canRetry && onAuthRetry
            ? {
                label: 'Erneut versuchen',
                onClick: onAuthRetry,
              }
            : undefined,
        dismissible: authError.severity !== 'high',
        duration: getDuration(priority),
      });
    }

    if (securityBlock?.isBlocked && securityBlock.reason) {
      toasts.push({
        id: 'security-block',
        type: 'security',
        priority: 'high',
        title: 'Nachricht blockiert',
        message: securityBlock.reason,
        action: onSecurityClear
          ? {
              label: 'OK',
              onClick: onSecurityClear,
            }
          : undefined,
        dismissible: true,
        duration: getDuration('high'),
      });
    }

    if (offlineQueueLength > 0) {
      toasts.push({
        id: 'offline-queue',
        type: 'warning',
        priority: 'medium',
        title: 'Offline-Modus',
        message: `${offlineQueueLength} Nachricht(en) warten auf Übertragung`,
        dismissible: false,
        duration: Infinity,
      });
    }

    errors.forEach((error) => {
      const priority: ToastPriority =
        error.severity === 'critical'
          ? 'critical'
          : error.severity === 'high'
            ? 'high'
            : error.severity === 'medium'
              ? 'medium'
              : 'low';

      toasts.push({
        id: error.id,
        type: 'error',
        priority,
        title: 'Fehler',
        message: error.message,
        action:
          error.retryable && onErrorRetry
            ? {
                label: 'Wiederholen',
                onClick: () => onErrorRetry(error.id),
              }
            : undefined,
        dismissible: true,
        duration: getDuration(priority),
      });
    });

    return toasts.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  };

  useEffect(() => {
    const toasts = generateToasts();
    const currentToastIds = new Set(toasts.map((t) => t.id));

    activeToastsRef.current.forEach((id) => {
      if (!currentToastIds.has(id)) {
        const toastId = toastIdsRef.current.get(id);
        if (toastId) {
          toast.dismiss(toastId);
          toastIdsRef.current.delete(id);
        }
        activeToastsRef.current.delete(id);
      }
    });

    const visibleToasts = toasts.slice(0, 2);

    visibleToasts.forEach((toastMsg) => {
      if (activeToastsRef.current.has(toastMsg.id)) {
        return;
      }

      const toastId = showToast(toastMsg);

      activeToastsRef.current.add(toastMsg.id);
      toastIdsRef.current.set(toastMsg.id, toastId);
    });
  }, [authError, securityBlock, offlineQueueLength, errors]);

  useEffect(() => {
    const activeToasts = activeToastsRef.current;
    const toastIds = toastIdsRef.current;

    return () => {
      activeToasts.forEach((id) => {
        const toastId = toastIds.get(id);
        if (toastId) {
          toast.dismiss(toastId);
        }
      });
      activeToasts.clear();
      toastIds.clear();
    };
  }, []);

  const showToast = (toastMsg: ToastMessage): string | number => {
    const icon = getIcon(toastMsg.type);

    const toastContent = (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toastMsg.title}</p>
          <p className="text-sm text-gray-600">{toastMsg.message}</p>
          {toastMsg.action && (
            <button
              onClick={() => {
                toastMsg.action?.onClick();
                const toastId = toastIdsRef.current.get(toastMsg.id);
                if (toastId) {
                  toast.dismiss(toastId);
                  activeToastsRef.current.delete(toastMsg.id);
                  toastIdsRef.current.delete(toastMsg.id);
                }
              }}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {toastMsg.action.label}
            </button>
          )}
        </div>
      </div>
    );

    let toastId: string | number;

    switch (toastMsg.type) {
      case 'error':
      case 'auth':
        toastId = toast.error(toastContent, {
          duration: toastMsg.duration,
          dismissible: toastMsg.dismissible,
        });
        break;
      case 'warning':
        toastId = toast.warning(toastContent, {
          duration: toastMsg.duration,
          dismissible: toastMsg.dismissible,
        });
        break;
      case 'success':
        toastId = toast.success(toastContent, {
          duration: toastMsg.duration,
          dismissible: toastMsg.dismissible,
        });
        break;
      default:
        toastId = toast.info(toastContent, {
          duration: toastMsg.duration,
          dismissible: toastMsg.dismissible,
        });
    }

    return toastId;
  };

  return null;
};

const getAuthErrorTitle = (type: WebSocketAuthError['type']): string => {
  switch (type) {
    case 'token_expired':
      return 'Sitzung abgelaufen';
    case 'token_refresh_failed':
      return 'Authentifizierung fehlgeschlagen';
    case 'connection_lost':
      return 'Verbindung verloren';
    case 'heartbeat_timeout':
      return 'Verbindung unterbrochen';
    default:
      return 'Verbindungsproblem';
  }
};
