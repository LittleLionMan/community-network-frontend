import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MessageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Message error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Etwas ist schiefgelaufen
            </h2>
            <p className="mb-4 text-gray-600">
              {this.state.error?.message ||
                'Ein unerwarteter Fehler ist aufgetreten.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Erneut versuchen</span>
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
