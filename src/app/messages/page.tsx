'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Settings, X } from 'lucide-react';
import MessagesInterface from '@/components/messages/MessagesInterface';
import { SecurityBanner } from '@/components/messages/SecurityBanner';
import { UnifiedErrorBoundary } from '@/components/errors/UnifiedErrorBoundary';
import { ErrorList } from '@/components/errors/UnifiedErrorComponents';
import { MessageSearch } from '@/components/messages/MessageSearch';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';
import {
  useConversations,
  useConversation,
  useUnreadCount,
} from '@/hooks/useMessages';
import { useMessageWebSocket } from '@/hooks/useMessageWebSocket';
import { useMessageSecurity } from '@/hooks/useMessageSecurity';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { useErrorHandler } from '@/lib/error-handling';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import type {
  Conversation,
  CreateConversationData,
  WebSocketMessage,
  UnreadCount,
} from '@/types/message';

interface SearchUser {
  id: number;
  display_name: string;
  email: string;
}

interface UserApiResponse {
  id: number;
  display_name: string;
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
  created_at: string;
  profile_image_url: string;
}

const NewConversationModal = React.memo<{
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (data: CreateConversationData) => Promise<void>;
}>(({ isOpen, onClose, onCreateConversation }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { validateAndSendMessage, isBlocked, blockReason, clearBlock } =
    useMessageSecurity();

  const handleSubmit = useCallback(async () => {
    if (!selectedUserId || !message.trim()) return;

    setIsLoading(true);
    try {
      await validateAndSendMessage(message.trim(), async (sanitizedContent) => {
        await onCreateConversation({
          participant_id: selectedUserId,
          initial_message: sanitizedContent,
        });
      });

      onClose();
      setSelectedUserId(null);
      setMessage('');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedUserId,
    message,
    validateAndSendMessage,
    onCreateConversation,
    onClose,
  ]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      params.append('page', '1');
      params.append('size', '10');

      const response = (await apiClient.users.list(
        params
      )) as UserApiResponse[];
      const userResults: SearchUser[] = response.map((user) => ({
        id: user.id,
        display_name: user.display_name,
        email:
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.display_name,
      }));

      setSearchResults(userResults);
    } catch (error) {
      console.error('User search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen, searchUsers]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId(null);
      setMessage('');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Neue Conversation starten
          </h2>

          <SecurityBanner
            isBlocked={isBlocked}
            blockReason={blockReason}
            onClear={clearBlock}
            type="error"
          />

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Empfänger suchen
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name oder Email eingeben..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearchQuery(user.display_name);
                        setSearchResults([]);
                      }}
                      className={`flex w-full items-center space-x-3 p-3 text-left hover:bg-gray-50 ${
                        selectedUserId === user.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-sm font-medium text-white">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.display_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="mt-2 text-sm text-gray-500">Suche...</div>
              )}
            </div>

            {selectedUserId && (
              <div className="rounded-lg bg-indigo-50 p-3">
                <div className="text-sm text-indigo-600">Ausgewählt:</div>
                <div className="font-medium text-indigo-900">{searchQuery}</div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Erste Nachricht
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Schreibe eine Nachricht..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                disabled={isBlocked}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedUserId || !message.trim() || isLoading || isBlocked
                }
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isLoading ? 'Erstelle...' : 'Konversation starten'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

NewConversationModal.displayName = 'NewConversationModal';

const SettingsModal = React.memo<{
  isOpen: boolean;
  onClose: () => void;
  notificationsEnabled: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
}>(({ isOpen, onClose, notificationsEnabled, isConnected, isReconnecting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Nachrichten-Einstellungen
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Nachrichten aktiviert
                </div>
                <div className="text-sm text-gray-500">
                  Erlaube anderen dir zu schreiben
                </div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Von Fremden</div>
                <div className="text-sm text-gray-500">
                  Nachrichten von unbekannten Personen
                </div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Browser-Benachrichtigungen
                </div>
                <div className="text-sm text-gray-500">
                  Desktop-Benachrichtigungen bei neuen Nachrichten
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  disabled
                  className="rounded"
                />
                <span
                  className={`text-xs ${
                    notificationsEnabled ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {notificationsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <button className="w-full rounded p-2 text-left text-red-600 hover:bg-red-50">
                Alle Conversations löschen
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>WebSocket Status:</span>
                  <span
                    className={isConnected ? 'text-green-600' : 'text-red-600'}
                  >
                    {isConnected ? 'Verbunden' : 'Getrennt'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reconnecting:</span>
                  <span>{isReconnecting ? 'Ja' : 'Nein'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsModal.displayName = 'SettingsModal';

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { errors, removeError, handleError, retryOperation } =
    useErrorHandler();

  const {
    isConnected,
    isReconnecting,
    typingUsers,
    startTyping,
    stopTyping,
    reconnect,
  } = useMessageWebSocket(selectedConversationId);

  const {
    conversations,
    isLoading: conversationsLoading,
    errors: conversationErrors,
    createConversation,
    refreshConversations,
    updateConversation,
    updateConversationUnreadCount,
    clearError: clearConversationError,
  } = useConversations();

  const {
    conversation: selectedConversation,
    messages,
    isLoading: messagesLoading,
    isLoadingMore,
    errors: messageErrors,
    offlineQueueLength,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    addMessage,
    updateMessage,
    loadMoreMessages,
    hasMoreMessages,
    clearError: clearMessageError,
  } = useConversation(selectedConversationId);

  const {
    unreadCount,
    updateUnreadCount,
    updateConversationUnreadCount: updateUnreadForConversation,
    refreshUnreadCount,
  } = useUnreadCount();

  const {
    validateAndSendMessage,
    isBlocked: isMainBlocked,
    blockReason: mainBlockReason,
    clearBlock: clearMainBlock,
  } = useMessageSecurity();

  const {
    isEnabled: notificationsEnabled,
    isSupported: notificationsSupported,
  } = useMessageNotifications();

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
  }, []);

  const handleSelectMessageFromSearch = useCallback(
    (conversationId: number, messageId: number) => {
      setSelectedConversationId(conversationId);
      setShowSearch(false);
    },
    []
  );

  const handleCreateConversation = useCallback(
    async (data: CreateConversationData) => {
      const success = await handleError(
        async () => {
          const newConversation = await createConversation(data);
          setSelectedConversationId(newConversation.id);
          setShowNewConversationModal(false);
        },
        { action: 'create_conversation', participantId: data.participant_id }
      );

      if (!success) {
        console.log('Failed to create conversation');
      }
    },
    [createConversation, handleError]
  );

  const handleSendMessage = useCallback(
    async (content: string, replyToId?: number) => {
      await handleError(
        async () => {
          await validateAndSendMessage(content, async (sanitizedContent) => {
            await sendMessage({
              content: sanitizedContent,
              reply_to_id: replyToId,
            });
          });
        },
        { action: 'send_message', conversationId: selectedConversationId }
      );
    },
    [validateAndSendMessage, sendMessage, selectedConversationId, handleError]
  );

  const handleEditMessage = useCallback(
    async (messageId: number, content: string) => {
      await handleError(
        async () => {
          await validateAndSendMessage(content, async (sanitizedContent) => {
            await editMessage(messageId, { content: sanitizedContent });
          });
        },
        { action: 'edit_message', messageId }
      );
    },
    [validateAndSendMessage, editMessage, handleError]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: number) => {
      if (
        confirm('Sind Sie sicher, dass Sie diese Nachricht löschen möchten?')
      ) {
        await handleError(
          async () => {
            await deleteMessage(messageId);
          },
          { action: 'delete_message', messageId }
        );
      }
    },
    [deleteMessage, handleError]
  );

  const handleTyping = useCallback(() => {
    if (selectedConversationId) {
      startTyping(selectedConversationId);
    }
  }, [selectedConversationId, startTyping]);

  const handleStopTyping = useCallback(() => {
    if (selectedConversationId) {
      stopTyping(selectedConversationId);
    }
  }, [selectedConversationId, stopTyping]);

  const handleRetry = useCallback(
    async (errorId: string) => {
      const error = errors[errorId];
      if (!error) return;

      const success = await retryOperation(async () => {
        switch (error.context?.action) {
          case 'load_conversations':
            await refreshConversations();
            break;
          case 'create_conversation':
            throw new Error('Please try creating the conversation again');
          default:
            window.location.reload();
        }
      });

      if (success) {
        removeError(errorId);
      }
    },
    [errors, retryOperation, refreshConversations, removeError]
  );

  useEffect(() => {
    const handleGlobalWebSocketMessage = (event: CustomEvent) => {
      const message: WebSocketMessage = event.detail;

      switch (message.type) {
        case 'new_message':
          if (message.message && message.conversation_id) {
            refreshConversations();

            if (message.conversation_id === selectedConversationId) {
              addMessage(message.message);

              if (message.message.sender.id !== user?.id) {
                markAsRead(message.message.id);
              }
            } else {
              refreshUnreadCount();
            }
          }
          break;

        case 'message_edited':
          if (
            message.message &&
            message.conversation_id === selectedConversationId
          ) {
            updateMessage(message.message);
          }
          break;

        case 'message_deleted':
          if (
            message.message &&
            message.conversation_id === selectedConversationId
          ) {
            updateMessage(message.message);
          }
          break;

        case 'messages_read':
          if (message.user_id !== user?.id) {
            refreshConversations();
            refreshUnreadCount();
          }
          break;

        case 'unread_count_update':
          if (message.data && typeof message.data === 'object') {
            const unreadData = message.data as unknown as UnreadCount;
            if ('total_unread' in unreadData && 'conversations' in unreadData) {
              updateUnreadCount(unreadData);
            }
          }
          break;

        default:
      }
    };

    window.addEventListener(
      'global-websocket-message',
      handleGlobalWebSocketMessage as EventListener
    );

    return () => {
      window.removeEventListener(
        'global-websocket-message',
        handleGlobalWebSocketMessage as EventListener
      );
    };
  }, [
    selectedConversationId,
    user?.id,
    addMessage,
    updateMessage,
    markAsRead,
    refreshUnreadCount,
    refreshConversations,
    updateUnreadCount,
  ]);

  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.is_read && lastMessage.sender.id !== user?.id) {
        markAsRead(lastMessage.id);
      }
    }
  }, [selectedConversationId, messages.length, user?.id, markAsRead, messages]);

  useEffect(() => {
    const handleMarkedRead = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      updateUnreadForConversation(conversationId, 0);
      updateConversationUnreadCount(conversationId, 0);
    };

    window.addEventListener(
      'messages-marked-read',
      handleMarkedRead as EventListener
    );
    return () =>
      window.removeEventListener(
        'messages-marked-read',
        handleMarkedRead as EventListener
      );
  }, [updateUnreadForConversation, updateConversationUnreadCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isConnected) {
        refreshConversations();
        refreshUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshConversations, refreshUnreadCount, isConnected]);

  const allErrors = useMemo(() => {
    const unifiedErrors = Object.values(errors);

    Object.entries(conversationErrors).forEach(([key, error]) => {
      unifiedErrors.push({
        id: `conversation-${key}`,
        type: 'unknown' as const,
        severity: 'medium' as const,
        message: error,
        context: { source: 'conversation', key },
        timestamp: Date.now(),
        retryable: true,
        userMessage: error,
      });
    });

    Object.entries(messageErrors).forEach(([key, error]) => {
      unifiedErrors.push({
        id: `message-${key}`,
        type: key === 'send' ? 'network' : ('unknown' as const),
        severity: 'medium' as const,
        message: error,
        context: { source: 'message', key },
        timestamp: Date.now(),
        retryable: true,
        userMessage: error,
      });
    });

    return unifiedErrors;
  }, [errors, conversationErrors, messageErrors]);

  const handleErrorDismiss = useCallback(
    (errorId: string) => {
      if (errorId.startsWith('conversation-')) {
        const key = errorId.replace('conversation-', '');
        clearConversationError(key);
      } else if (errorId.startsWith('message-')) {
        const key = errorId.replace('message-', '');
        clearMessageError(key);
      } else {
        removeError(errorId);
      }
    },
    [clearConversationError, clearMessageError, removeError]
  );
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Nicht angemeldet
          </h2>
          <p className="text-gray-600">
            Bitte melde dich an um Nachrichten zu sehen.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  return (
    <UnifiedErrorBoundary>
      <div className="flex h-screen flex-col">
        {notificationsSupported && !notificationsEnabled && (
          <NotificationPermissionBanner />
        )}

        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Nachrichten</h1>

            {unreadCount.total_unread > 0 && (
              <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-medium text-white">
                {unreadCount.total_unread > 99
                  ? '99+'
                  : unreadCount.total_unread}
              </span>
            )}

            <div
              className={`flex items-center space-x-1 text-xs ${
                isConnected ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span>
                {isConnected
                  ? 'Online'
                  : isReconnecting
                    ? 'Verbinde...'
                    : 'Offline'}
              </span>
            </div>

            {notificationsSupported && (
              <div
                className={`flex items-center space-x-1 text-xs ${
                  notificationsEnabled ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    notificationsEnabled ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                />
                <span>
                  {notificationsEnabled
                    ? 'Benachrichtigungen an'
                    : 'Benachrichtigungen aus'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
              title="Nachrichten durchsuchen"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Suchen</span>
            </button>

            <button
              onClick={() => setShowNewConversationModal(true)}
              className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Neue Nachricht</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Settings className="h-5 w-5" />
            </button>

            {!isConnected && (
              <button
                onClick={reconnect}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
                title="Verbindung wiederherstellen"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>

        {/* Unified Error Display */}
        {allErrors.length > 0 && (
          <div className="border-b bg-gray-50 px-4 py-2">
            <ErrorList
              errors={allErrors}
              onDismiss={handleErrorDismiss}
              onRetry={handleRetry}
              maxVisible={3}
              compact
            />
          </div>
        )}

        <div className="space-y-2">
          <SecurityBanner
            isBlocked={isMainBlocked}
            blockReason={mainBlockReason}
            onClear={clearMainBlock}
            type="error"
          />

          {offlineQueueLength > 0 && (
            <div className="mx-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full bg-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    {offlineQueueLength} Nachricht(en) warten auf Übertragung
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {conversationsLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <p className="text-gray-600">Lade Conversations...</p>
              </div>
            </div>
          ) : (
            <UnifiedErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="w-full max-w-md text-center">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                      <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        Interface-Fehler
                      </h2>
                      <p className="mb-4 text-gray-600">
                        Das Nachrichten-Interface konnte nicht geladen werden.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                      >
                        Seite neu laden
                      </button>
                    </div>
                  </div>
                </div>
              }
            >
              <MessagesInterface
                conversations={conversations}
                selectedConversation={selectedConversation}
                messages={messages}
                currentUserId={user.id}
                typingUsers={typingUsers}
                onSelectConversation={handleSelectConversation}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onLoadMoreMessages={loadMoreMessages}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                isLoading={messagesLoading || isMainBlocked}
                isLoadingMore={isLoadingMore}
                hasMoreMessages={hasMoreMessages}
              />
            </UnifiedErrorBoundary>
          )}
        </div>

        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onCreateConversation={handleCreateConversation}
        />

        <MessageSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectMessage={handleSelectMessageFromSearch}
        />

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          notificationsEnabled={notificationsEnabled}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
        />
      </div>
    </UnifiedErrorBoundary>
  );
}
