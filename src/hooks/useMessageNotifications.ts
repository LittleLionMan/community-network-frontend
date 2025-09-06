import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useAuthStore } from '@/store/auth';

export function useMessageNotifications() {
  const { showMessageNotification, permissionState } = useNotifications();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (
        permissionState.permission === 'granted' &&
        user &&
        message.type === 'new_message' &&
        message.message?.sender.id !== user.id &&
        document.hidden
      ) {
        showMessageNotification(
          message.message.sender.display_name,
          message.message.content,
          message.conversation_id
        );
      }
    };

    window.addEventListener(
      'websocket-message',
      handleWebSocketMessage as EventListener
    );

    return () => {
      window.removeEventListener(
        'websocket-message',
        handleWebSocketMessage as EventListener
      );
    };
  }, [permissionState.permission, user, showMessageNotification]);

  const checkAndRequestPermission = useCallback(async () => {
    if (
      permissionState.isSupported &&
      permissionState.permission === 'default'
    ) {
      return false;
    }
    return permissionState.permission === 'granted';
  }, [permissionState]);

  return {
    isEnabled: permissionState.permission === 'granted',
    isSupported: permissionState.isSupported,
    checkAndRequestPermission,
  };
}
