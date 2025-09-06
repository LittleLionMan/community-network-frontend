'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Settings, X } from 'lucide-react';
import MessagesInterface from '@/components/messages/MessagesInterface';
import { SecurityBanner } from '@/components/messages/SecurityBanner';
import { MessageError } from '@/components/messages/MessageError';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';
import {
  useConversations,
  useConversation,
  useMessageWebSocket,
  useUnreadCount,
} from '@/hooks/useMessages';
import { useMessageSecurity } from '@/hooks/useMessageSecurity';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { useAuthStore } from '@/store/auth';
import type { Conversation, CreateConversationData } from '@/types/message';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (data: CreateConversationData) => Promise<void>;
}

interface SearchUser {
  id: number;
  display_name: string;
  email: string;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { validateAndSendMessage, isBlocked, blockReason, clearBlock } =
    useMessageSecurity();

  const handleSubmit = async () => {
    if (!selectedUserId || !message.trim()) return;

    const success = await validateAndSendMessage(
      message.trim(),
      async (sanitizedContent) => {
        await onCreateConversation({
          participant_id: selectedUserId,
          initial_message: sanitizedContent,
        });
      }
    );

    if (success) {
      onClose();
      setSelectedUserId(null);
      setMessage('');
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const mockResults = [
        { id: 1, display_name: 'Anna Mueller', email: 'anna@example.com' },
        { id: 2, display_name: 'Max Schmidt', email: 'max@example.com' },
        { id: 3, display_name: 'Lisa Weber', email: 'lisa@example.com' },
      ].filter(
        (user) =>
          user.display_name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
                {isLoading ? 'Sende...' : 'Conversation starten'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hooks
  const {
    conversations,
    isLoading: conversationsLoading,
    errors: conversationErrors,
    createConversation,
    refreshConversations,
    clearError: clearConversationError,
  } = useConversations();

  const {
    conversation: selectedConversation,
    messages,
    isLoading: messagesLoading,
    errors: messageErrors,
    offlineQueueLength,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMoreMessages,
    hasMoreMessages,
    clearError: clearMessageError,
  } = useConversation(selectedConversationId);

  const { unreadCount, updateUnreadCount } = useUnreadCount();

  const { isConnected, typingUsers, startTyping, stopTyping } =
    useMessageWebSocket(selectedConversationId);

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

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const message = event.detail;

      switch (message.type) {
        case 'new_message':
          if (message.conversation_id === selectedConversationId) {
            markAsRead(message.message?.id);
          } else {
            refreshConversations();
          }
          break;

        case 'unread_count_update':
          updateUnreadCount(message.data);
          break;
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
  }, [
    selectedConversationId,
    markAsRead,
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
  }, [selectedConversationId, messages, markAsRead, user?.id]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
  };

  const handleCreateConversation = async (data: CreateConversationData) => {
    try {
      const newConversation = await createConversation(data);
      setSelectedConversationId(newConversation.id);
      setShowNewConversationModal(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string, replyToId?: number) => {
    await validateAndSendMessage(content, async (sanitizedContent) => {
      await sendMessage({ content: sanitizedContent, reply_to_id: replyToId });
    });
  };

  const handleEditMessage = async (messageId: number, content: string) => {
    await validateAndSendMessage(content, async (sanitizedContent) => {
      await editMessage(messageId, { content: sanitizedContent });
    });
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (confirm('Sind Sie sicher, dass Sie diese Nachricht löschen möchten?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

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
        </div>
      </div>
    );
  }

  if (Object.keys(conversationErrors).length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Fehler</h2>
          <p className="text-gray-600">
            {Object.values(conversationErrors)[0]}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {notificationsSupported && !notificationsEnabled && (
        <NotificationPermissionBanner />
      )}

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Nachrichten</h1>

          {unreadCount.total_unread > 0 && (
            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-medium text-white">
              {unreadCount.total_unread > 99 ? '99+' : unreadCount.total_unread}
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
            <span>{isConnected ? 'Online' : 'Offline'}</span>
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
        </div>
      </div>

      <div className="space-y-2">
        <SecurityBanner
          isBlocked={isMainBlocked}
          blockReason={mainBlockReason}
          onClear={clearMainBlock}
          type="error"
        />

        {Object.entries(messageErrors).map(([key, error]) => (
          <MessageError
            key={key}
            error={error}
            onDismiss={() => clearMessageError(key)}
            type={
              key === 'send' && offlineQueueLength > 0 ? 'warning' : 'error'
            }
          />
        ))}

        {offlineQueueLength > 0 && (
          <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
            {offlineQueueLength} Nachricht(en) warten auf Übertragung
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
            onTyping={startTyping}
            onStopTyping={stopTyping}
            isLoading={messagesLoading || isMainBlocked}
            hasMoreMessages={hasMoreMessages}
          />
        )}
      </div>

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleCreateConversation}
      />

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nachrichten-Einstellungen
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
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
                      className={`text-xs ${notificationsEnabled ? 'text-green-600' : 'text-gray-400'}`}
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
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setShowSettings(false)}
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
      )}
    </div>
  );
}
