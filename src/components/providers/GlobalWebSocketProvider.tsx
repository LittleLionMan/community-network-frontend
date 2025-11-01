'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { AuthenticatedWebSocket } from '@/lib/websocket/AuthenticatedWebSocket';
import type { WebSocketMessage } from '@/types/message';
import type {
  WebSocketConnectionState,
  WebSocketAuthError,
} from '@/types/websocket';

export function GlobalWebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    let userWs: AuthenticatedWebSocket | null = null;

    const connectUserWebSocket = () => {
      const token = localStorage.getItem('auth_token');
      if (!token || token === 'undefined') {
        console.warn('No valid token for WebSocket connection');
        return;
      }

      try {
        const wsUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ||
          'ws://localhost:8000';

        userWs = new AuthenticatedWebSocket(`${wsUrl}/api/messages/ws/user`);

        const broadcastState = () => {
          if (userWs) {
            const state = userWs.getState();
            window.dispatchEvent(
              new CustomEvent('global-websocket-state', {
                detail: state,
              })
            );
          }
        };

        userWs.addEventListener('connected', () => {
          window.dispatchEvent(
            new CustomEvent('global-websocket-state', {
              detail: {
                isConnected: true,
                isReconnecting: false,
                reconnectAttempts: 0,
              },
            })
          );
        });

        userWs.addEventListener('disconnected', () => {
          window.dispatchEvent(
            new CustomEvent('global-websocket-state', {
              detail: { isConnected: false },
            })
          );
        });

        userWs.addEventListener('state-change', (event: Event) => {
          const customEvent = event as CustomEvent<WebSocketConnectionState>;
          window.dispatchEvent(
            new CustomEvent('global-websocket-state', {
              detail: customEvent.detail,
            })
          );
        });

        userWs.addEventListener('auth-error', (event: Event) => {
          const customEvent = event as CustomEvent<WebSocketAuthError>;
          window.dispatchEvent(
            new CustomEvent('global-websocket-state', {
              detail: { authError: customEvent.detail },
            })
          );
        });

        userWs.addEventListener('message', (event: Event) => {
          const customEvent = event as CustomEvent<WebSocketMessage>;
          window.dispatchEvent(
            new CustomEvent('global-websocket-message', {
              detail: customEvent.detail,
            })
          );
        });

        userWs.connect(token);
        setTimeout(broadcastState, 100);
      } catch (err) {
        console.error('Failed to create global user WebSocket:', err);
      }
    };

    const handleStateRequest = () => {
      if (userWs) {
        const state = userWs.getState();
        window.dispatchEvent(
          new CustomEvent('global-websocket-state', {
            detail: state,
          })
        );
      }
    };

    const handleReconnect = () => {
      if (userWs) {
        userWs.disconnect();
      }
      connectUserWebSocket();
    };

    const handleDisconnect = () => {
      if (userWs) {
        userWs.disconnect();
        userWs = null;
      }
    };

    window.addEventListener('global-websocket-reconnect', handleReconnect);
    window.addEventListener('global-websocket-disconnect', handleDisconnect);
    window.addEventListener('request-websocket-state', handleStateRequest);

    const connectWithDelay = () => {
      const token = localStorage.getItem('auth_token');
      if (token && token !== 'undefined') {
        connectUserWebSocket();
      } else {
        setTimeout(connectWithDelay, 100);
      }
    };

    connectWithDelay();

    return () => {
      window.removeEventListener('global-websocket-reconnect', handleReconnect);
      window.removeEventListener(
        'global-websocket-disconnect',
        handleDisconnect
      );

      if (userWs) {
        userWs.destroy();
        userWs = null;
      }
    };
  }, [user, isAuthenticated]);

  return <>{children}</>;
}
