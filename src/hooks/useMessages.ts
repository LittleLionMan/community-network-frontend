'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type {
  Conversation,
  ConversationDetail,
  Message,
  CreateConversationData,
  CreateMessageData,
  UpdateMessageData,
  MessagePrivacySettings,
  UnreadCount,
} from '@/types/message';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface ErrorState {
  [key: string]: string;
}

interface PaginationState {
  currentPage: number;
  isLoading: boolean;
  hasMore: boolean;
}

// Retry utility hook
function useRetry() {
  const retry = useCallback(
    async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      const { maxAttempts = 3, delay = 1000, backoff = true } = options;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxAttempts) {
            throw error;
          }
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
      throw new Error('Max retry attempts reached');
    },
    []
  );

  return { retry };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [errors, setErrors] = useState<ErrorState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    isLoading: true,
    hasMore: false,
  });

  // Use refs to prevent race conditions
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { retry } = useRetry();

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const loadConversations = useCallback(
    async (refresh = false, signal?: AbortSignal) => {
      // Prevent multiple concurrent requests
      if (loadingRef.current && !refresh) {
        return;
      }

      loadingRef.current = true;

      try {
        setPagination((prev) => ({
          ...prev,
          isLoading: true,
        }));

        clearError('load');

        const targetPage = refresh ? 1 : pagination.currentPage;

        const response = await retry(() => {
          if (signal?.aborted) {
            throw new Error('Request aborted');
          }
          return apiClient.messages.getConversations(targetPage, 20);
        });

        // Check if request was aborted
        if (signal?.aborted) {
          return;
        }

        setConversations((prev) => {
          if (refresh) {
            return response.conversations;
          }
          // Prevent duplicates when concatenating
          const existingIds = new Set(prev.map((conv) => conv.id));
          const newConversations = response.conversations.filter(
            (conv) => !existingIds.has(conv.id)
          );
          return [...prev, ...newConversations];
        });

        setPagination((prev) => ({
          currentPage: refresh ? 2 : prev.currentPage + 1,
          isLoading: false,
          hasMore: response.has_more,
        }));
      } catch (err) {
        if (signal?.aborted) {
          return; // Don't set errors for aborted requests
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load conversations';
        setErrors((prev) => ({ ...prev, load: errorMessage }));

        setPagination((prev) => ({
          ...prev,
          isLoading: false,
        }));
      } finally {
        loadingRef.current = false;
      }
    },
    [pagination.currentPage, retry, clearError]
  );

  const createConversation = useCallback(
    async (data: CreateConversationData) => {
      try {
        clearError('create');
        const newConversation = await retry(() =>
          apiClient.messages.createConversation(data)
        );

        setConversations((prev) => {
          // Check if conversation already exists (prevent duplicates)
          const exists = prev.some((conv) => conv.id === newConversation.id);
          if (exists) {
            return prev;
          }
          return [newConversation, ...prev];
        });

        return newConversation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create conversation';
        setErrors((prev) => ({ ...prev, create: errorMessage }));
        throw new Error(errorMessage);
      }
    },
    [retry, clearError]
  );

  const updateConversation = useCallback(
    (updatedConversation: Conversation) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      );
    },
    []
  );

  const updateConversationUnreadCount = useCallback(
    (conversationId: number, unreadCount: number) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, unread_count: unreadCount }
            : conv
        )
      );
    },
    []
  );

  const refreshConversations = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Reset pagination state
    setPagination({
      currentPage: 1,
      isLoading: true,
      hasMore: false,
    });

    loadConversations(true, abortControllerRef.current.signal);
  }, [loadConversations]);

  const loadMore = useCallback(() => {
    if (!pagination.isLoading && pagination.hasMore) {
      loadConversations(false);
    }
  }, [loadConversations, pagination.isLoading, pagination.hasMore]);

  // Initial load with proper cleanup
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    loadConversations(true, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []); // Only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    conversations,
    isLoading: pagination.isLoading,
    errors,
    hasMore: pagination.hasMore,
    loadMore,
    createConversation,
    updateConversation,
    updateConversationUnreadCount,
    clearError,
    refreshConversations,
  };
}

export function useConversation(conversationId: number | null) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [errors, setErrors] = useState<ErrorState>({});
  const [loadingStates, setLoadingStates] = useState({
    initial: false,
    loadingMore: false,
  });
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<CreateMessageData[]>([]);

  const currentConversationIdRef = useRef<number | null>(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { retry } = useRetry();

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const loadConversation = useCallback(
    async (targetConversationId: number, signal?: AbortSignal) => {
      if (
        isLoadingRef.current &&
        currentConversationIdRef.current === targetConversationId
      ) {
        return;
      }

      isLoadingRef.current = true;
      currentConversationIdRef.current = targetConversationId;

      try {
        setLoadingStates((prev) => ({ ...prev, initial: true }));
        clearError('load');

        const response = await retry(() => {
          if (signal?.aborted) {
            throw new Error('Request aborted');
          }
          return apiClient.messages.getConversation(targetConversationId);
        });

        if (
          signal?.aborted ||
          currentConversationIdRef.current !== targetConversationId
        ) {
          return;
        }

        setConversation(response);
        setMessages(response.messages);
        setHasMoreMessages(response.has_more);

        currentConversationIdRef.current = targetConversationId;
      } catch (err) {
        if (
          signal?.aborted ||
          currentConversationIdRef.current !== targetConversationId
        ) {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load conversation';
        setErrors((prev) => ({ ...prev, load: errorMessage }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, initial: false }));
        isLoadingRef.current = false;
      }
    },
    [retry, clearError]
  );

  const sendMessage = useCallback(
    async (data: CreateMessageData) => {
      const targetConversationId = currentConversationIdRef.current;
      if (!targetConversationId) throw new Error('No conversation selected');

      try {
        clearError('send');
        const newMessage = await retry(() =>
          apiClient.messages.sendMessage(targetConversationId, data)
        );

        // Only add message if we're still on the same conversation
        if (currentConversationIdRef.current === targetConversationId) {
          setMessages((prev) => {
            // Prevent duplicates
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }

        return newMessage;
      } catch (err) {
        // Handle offline scenario
        if (err instanceof Error && err.message.includes('fetch')) {
          setOfflineQueue((prev) => [...prev, data]);
          setErrors((prev) => ({
            ...prev,
            send: 'Nachricht wird gesendet, sobald die Verbindung wiederhergestellt ist.',
          }));
          return null;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setErrors((prev) => ({ ...prev, send: errorMessage }));
        throw new Error(errorMessage);
      }
    },
    [retry, clearError]
  );

  const editMessage = useCallback(
    async (messageId: number, data: UpdateMessageData) => {
      try {
        clearError('edit');
        const updatedMessage = await retry(() =>
          apiClient.messages.editMessage(messageId, data)
        );

        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
        );

        return updatedMessage;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to edit message';
        setErrors((prev) => ({ ...prev, edit: errorMessage }));
        throw new Error(errorMessage);
      }
    },
    [retry, clearError]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      try {
        clearError('delete');
        await retry(() => apiClient.messages.deleteMessage(messageId));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, is_deleted: true, content: '[Message deleted]' }
              : msg
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete message';
        setErrors((prev) => ({ ...prev, delete: errorMessage }));
        throw new Error(errorMessage);
      }
    },
    [retry, clearError]
  );

  const markAsRead = useCallback(async (upToMessageId?: number) => {
    const targetConversationId = currentConversationIdRef.current;
    if (!targetConversationId) return;

    try {
      await apiClient.messages.markMessagesAsRead(
        targetConversationId,
        upToMessageId
      );

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('messages-marked-read', {
          detail: { conversationId: targetConversationId, upToMessageId },
        })
      );

      // Only update if we're still on the same conversation
      if (currentConversationIdRef.current === targetConversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            !upToMessageId || msg.id <= upToMessageId
              ? { ...msg, is_read: true }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    const targetConversationId = currentConversationIdRef.current;
    if (
      !targetConversationId ||
      loadingStates.loadingMore ||
      !hasMoreMessages
    ) {
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, loadingMore: true }));

      const oldestMessageId = messages.length > 0 ? messages[0].id : undefined;

      const response = await retry(() =>
        apiClient.messages.getMessages(
          targetConversationId,
          1,
          50,
          oldestMessageId
        )
      );

      // Only update if we're still on the same conversation
      if (currentConversationIdRef.current === targetConversationId) {
        setMessages((prev) => {
          // Prevent duplicates when prepending
          const existingIds = new Set(prev.map((msg) => msg.id));
          const newMessages = response.messages.filter(
            (msg) => !existingIds.has(msg.id)
          );
          return [...newMessages, ...prev];
        });

        setHasMoreMessages(response.has_more);
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, loadingMore: false }));
    }
  }, [messages.length, hasMoreMessages, loadingStates.loadingMore, retry]);

  const addMessage = useCallback((message: Message) => {
    if (currentConversationIdRef.current === message.conversation_id) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }

        const newMessages = [...prev, message];

        return newMessages;
      });
    }
  }, []);

  const updateMessage = useCallback((updatedMessage: Message) => {
    if (currentConversationIdRef.current === updatedMessage.conversation_id) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    }
  }, []);

  const processOfflineQueue = useCallback(async () => {
    const targetConversationId = currentConversationIdRef.current;
    if (!targetConversationId || offlineQueue.length === 0) return;

    const failedMessages: CreateMessageData[] = [];

    for (const messageData of offlineQueue) {
      try {
        await apiClient.messages.sendMessage(targetConversationId, messageData);
      } catch (error) {
        failedMessages.push(messageData);
      }
    }

    setOfflineQueue(failedMessages);

    if (failedMessages.length === 0) {
      clearError('send');
    }
  }, [offlineQueue, clearError]);

  // Handle online event for offline queue processing
  useEffect(() => {
    const handleOnline = () => {
      processOfflineQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processOfflineQueue]);

  // Load conversation when ID changes
  useEffect(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (conversationId) {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      loadConversation(conversationId, abortController.signal);
    } else {
      // Clear state when no conversation selected
      currentConversationIdRef.current = null;
      setConversation(null);
      setMessages([]);
      setHasMoreMessages(false);
      setErrors({});
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [conversationId, loadConversation]);

  return {
    conversation,
    messages,
    isLoading: loadingStates.initial,
    isLoadingMore: loadingStates.loadingMore,
    errors,
    hasMoreMessages,
    offlineQueueLength: offlineQueue.length,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    addMessage,
    updateMessage,
    clearError,
    processOfflineQueue,
    refreshConversation: () => {
      if (conversationId) {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        loadConversation(conversationId, abortController.signal);
      }
    },
  };
}

// Rest of the hooks remain the same but with better state management
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({
    total_unread: 0,
    conversations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const { retry } = useRetry();

  const loadUnreadCount = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent concurrent loads

    isLoadingRef.current = true;
    try {
      const response = await retry(() => apiClient.messages.getUnreadCount());
      setUnreadCount(response);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [retry]);

  const updateConversationUnreadCount = useCallback(
    (conversationId: number, count: number) => {
      setUnreadCount((prev) => {
        const existingConvIndex = prev.conversations.findIndex(
          (c) => c.conversation_id === conversationId
        );
        const newConversations = [...prev.conversations];

        if (existingConvIndex >= 0) {
          if (count === 0) {
            newConversations.splice(existingConvIndex, 1);
          } else {
            newConversations[existingConvIndex] = {
              conversation_id: conversationId,
              unread_count: count,
            };
          }
        } else if (count > 0) {
          newConversations.push({
            conversation_id: conversationId,
            unread_count: count,
          });
        }

        const total_unread = newConversations.reduce(
          (sum, conv) => sum + conv.unread_count,
          0
        );

        return {
          total_unread,
          conversations: newConversations,
        };
      });
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return {
    unreadCount,
    isLoading,
    updateUnreadCount: setUnreadCount,
    updateConversationUnreadCount,
    refreshUnreadCount: loadUnreadCount,
  };
}

export function useMessagePrivacy() {
  const [settings, setSettings] = useState<MessagePrivacySettings>({
    messages_enabled: true,
    messages_from_strangers: true,
    messages_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const { retry } = useRetry();
  const { user, isAuthenticated } = useAuthStore();

  const loadSettings = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    isLoadingRef.current = true;
    try {
      const response = await retry(() =>
        apiClient.messages.getPrivacySettings()
      );
      setSettings(response);
    } catch (err) {
      console.error('Failed to load privacy settings:', err);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [retry, user, isAuthenticated]);

  const updateSettings = useCallback(
    async (newSettings: Partial<MessagePrivacySettings>) => {
      try {
        await retry(() =>
          apiClient.messages.updatePrivacySettings(newSettings)
        );
        setSettings((prev) => ({ ...prev, ...newSettings }));
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : 'Failed to update privacy settings'
        );
      }
    },
    [retry]
  );

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings();
    } else {
      setSettings({
        messages_enabled: true,
        messages_from_strangers: true,
        messages_notifications: true,
      });
      setIsLoading(false);
    }
  }, [loadSettings, isAuthenticated, user]);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: loadSettings,
  };
}
