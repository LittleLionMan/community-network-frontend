import React, { Component, ReactNode } from 'react';
import { ErrorClassifier, ErrorLogger, AppError } from '@/lib/error-handling';
import { ErrorBoundaryFallback } from './UnifiedErrorComponents';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error?: AppError;
}

export class UnifiedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const appError = ErrorClassifier.classify(error, {
      component: 'ErrorBoundary',
      boundary: true,
    });

    return { hasError: true, error: appError };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorClassifier.classify(error, {
      component: 'ErrorBoundary',
      errorInfo,
      boundary: true,
    });

    ErrorLogger.log(appError);
    this.props.onError?.(appError);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          resetError={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export function useErrorBoundary() {
  const [error, setError] = React.useState<AppError | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback(
    (error: unknown, context?: Record<string, unknown>) => {
      const appError = ErrorClassifier.classify(error, context);
      ErrorLogger.log(appError);
      setError(appError);
    },
    []
  );

  React.useEffect(() => {
    if (error) {
      if (error.type === 'network' && error.severity === 'low') {
        const timer = setTimeout(() => {
          resetError();
        }, 10000);

        return () => clearTimeout(timer);
      }
    }
  }, [error, resetError]);

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null,
  };
}
