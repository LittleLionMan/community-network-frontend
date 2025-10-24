export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'auth' | 'permission' | 'server' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  originalError?: Error;
  context?: Record<string, unknown>;
  timestamp: number;
  retryable: boolean;
  userMessage: string;
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

export interface ErrorState {
  [key: string]: AppError;
}

export class ErrorClassifier {
  static classify(error: unknown, context?: Record<string, unknown>): AppError {
    const timestamp = Date.now();
    const id = `error_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    if (error instanceof Error) {
      if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        return {
          id,
          type: 'network',
          severity: 'medium',
          message: error.message,
          originalError: error,
          context,
          timestamp,
          retryable: true,
          userMessage:
            'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.',
        };
      }

      if (
        error.message.includes('401') ||
        error.message.includes('unauthorized')
      ) {
        return {
          id,
          type: 'auth',
          severity: 'high',
          message: error.message,
          originalError: error,
          context,
          timestamp,
          retryable: false,
          userMessage:
            'Authentifizierung fehlgeschlagen. Bitte melde dich erneut an.',
        };
      }

      if (
        error.message.includes('403') ||
        error.message.includes('forbidden')
      ) {
        return {
          id,
          type: 'permission',
          severity: 'medium',
          message: error.message,
          originalError: error,
          context,
          timestamp,
          retryable: false,
          userMessage: 'Du hast keine Berechtigung für diese Aktion.',
        };
      }

      if (error.message.includes('5') && error.message.length === 3) {
        return {
          id,
          type: 'server',
          severity: 'high',
          message: error.message,
          originalError: error,
          context,
          timestamp,
          retryable: true,
          userMessage: 'Serverfehler. Bitte versuche es später erneut.',
        };
      }

      if (
        error.message.includes('400') ||
        error.message.includes('validation')
      ) {
        return {
          id,
          type: 'validation',
          severity: 'low',
          message: error.message,
          originalError: error,
          context,
          timestamp,
          retryable: false,
          userMessage:
            'Eingabedaten sind ungültig. Bitte überprüfe deine Eingaben.',
        };
      }

      return {
        id,
        type: 'unknown',
        severity: 'medium',
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: true,
        userMessage: 'Ein unerwarteter Fehler ist aufgetreten.',
      };
    }

    if (typeof error === 'string') {
      return {
        id,
        type: 'unknown',
        severity: 'medium',
        message: error,
        context,
        timestamp,
        retryable: true,
        userMessage: error,
      };
    }

    return {
      id,
      type: 'unknown',
      severity: 'medium',
      message: 'Unknown error occurred',
      context,
      timestamp,
      retryable: true,
      userMessage: 'Ein unbekannter Fehler ist aufgetreten.',
    };
  }
}

export class ErrorRecovery {
  static getRecoveryActions(error: AppError): ErrorAction[] {
    const actions: ErrorAction[] = [];

    switch (error.type) {
      case 'network':
        actions.push({
          label: 'Erneut versuchen',
          action: () => window.location.reload(),
          primary: true,
        });
        break;

      case 'auth':
        actions.push({
          label: 'Erneut anmelden',
          action: () => {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
          },
          primary: true,
        });
        break;

      case 'server':
        actions.push({
          label: 'Seite neu laden',
          action: () => window.location.reload(),
          primary: true,
        });
        actions.push({
          label: 'Support kontaktieren',
          action: () => {
            window.open('mailto:support@example.com', '_blank');
          },
        });
        break;

      case 'validation':
        break;

      default:
        if (error.retryable) {
          actions.push({
            label: 'Erneut versuchen',
            action: () => window.location.reload(),
            primary: true,
          });
        }
    }

    return actions;
  }
}

export class ErrorLogger {
  static log(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logData = {
      id: error.id,
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console[logLevel](
      `[${error.type.toUpperCase()}] ${error.message}`,
      logData
    );

    if (error.severity === 'critical' || error.severity === 'high') {
      this.sendToExternalLogger();
    }
  }

  private static getLogLevel(
    severity: AppError['severity']
  ): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'error';
    }
  }

  private static sendToExternalLogger(): void {
    // Implement external logging service integration
    // For example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry integration
      // Sentry.captureException(error, { extra: logData });
    }
  }
}

import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorState>({});

  const addError = useCallback(
    (error: unknown, context?: Record<string, unknown>) => {
      const appError = ErrorClassifier.classify(error, context);
      ErrorLogger.log(appError);

      setErrors((prev) => ({
        ...prev,
        [appError.id]: appError,
      }));

      return appError;
    },
    []
  );

  const removeError = useCallback((errorId: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[errorId];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleError = useCallback(
    async (
      operation: () => Promise<void>,
      context?: Record<string, unknown>
    ): Promise<boolean> => {
      try {
        await operation();
        return true;
      } catch (error) {
        addError(error, context);
        return false;
      }
    },
    [addError]
  );

  const retryOperation = useCallback(
    async (
      operation: () => Promise<void>,
      maxAttempts = 3,
      delay = 1000
    ): Promise<boolean> => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await operation();
          return true;
        } catch (error) {
          if (attempt === maxAttempts) {
            addError(error, { attempt, maxAttempts });
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
      return false;
    },
    [addError]
  );

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError,
    retryOperation,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
  };
}

export function useErrorBoundary() {
  const [error, setError] = useState<AppError | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback(
    (error: unknown, context?: Record<string, unknown>) => {
      const appError = ErrorClassifier.classify(error, context);
      ErrorLogger.log(appError);
      setError(appError);
    },
    []
  );

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null,
  };
}
