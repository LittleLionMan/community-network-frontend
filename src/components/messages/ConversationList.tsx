import React, { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { ConversationListItem } from './ConversationListItem';
import type { Conversation } from '@/types/message';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: number;
  selectedConversationId: number | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = React.memo(
  ({
    conversations,
    currentUserId,
    selectedConversationId,
    onSelectConversation,
    isLoading = false,
    emptyStateMessage = 'Keine Conversations gefunden',
    className = '',
  }) => {
    const sortedConversations = useMemo(() => {
      return [...conversations].sort((a, b) => {
        const timeA = a.last_message_at
          ? new Date(a.last_message_at).getTime()
          : 0;
        const timeB = b.last_message_at
          ? new Date(b.last_message_at).getTime()
          : 0;
        return timeB - timeA;
      });
    }, [conversations]);

    if (isLoading) {
      return (
        <div className={`flex flex-1 items-center justify-center ${className}`}>
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-600">Lade Conversations...</p>
          </div>
        </div>
      );
    }

    if (sortedConversations.length === 0) {
      return (
        <div
          className={`flex flex-1 items-center justify-center p-4 ${className}`}
        >
          <div className="text-center">
            <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
            <p className="text-sm text-gray-500 sm:text-base">
              {emptyStateMessage}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex-1 overflow-y-auto ${className}`}>
        {sortedConversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            currentUserId={currentUserId}
            isSelected={selectedConversationId === conversation.id}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    );
  }
);

ConversationList.displayName = 'ConversationList';
