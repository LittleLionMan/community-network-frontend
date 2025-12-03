import React, { useCallback, useMemo } from 'react';
import { Archive, VolumeX } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { parseTransactionData } from '@/lib/parseTransactionData';
import type { Conversation } from '@/types/message';

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: number;
  isSelected?: boolean;
  onClick: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> =
  React.memo(({ conversation, currentUserId, isSelected = false, onClick }) => {
    const otherParticipant = useMemo(
      () => conversation.participants.find((p) => p.user.id !== currentUserId),
      [conversation.participants, currentUserId]
    );

    const participantName = otherParticipant?.user.display_name || 'Unbekannt';

    const formatTime = useCallback((dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString('de-DE', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
        });
      }
    }, []);

    const truncatedContent = useMemo(() => {
      if (!conversation.last_message) return '';

      if (conversation.last_message.transaction_data) {
        try {
          const trans = parseTransactionData(
            conversation.last_message.transaction_data
          );
          const bookTitle = trans.offer?.title || 'Unbekanntes Buch';

          const statusMap: Record<string, string> = {
            pending: '📚 Buchausleihe angefragt',
            accepted: '✅ Anfrage akzeptiert',
            rejected: '❌ Anfrage abgelehnt',
            time_confirmed: '📅 Termin bestätigt',
            completed: '✅ Übergabe abgeschlossen',
            cancelled: '🚫 Storniert',
            expired: '⏰ Abgelaufen',
          };

          const statusText = statusMap[trans.status] || 'Transaction';
          return `${statusText}: ${bookTitle}`;
        } catch (e) {
          console.error('Failed to parse transaction data:', e);
        }
      }

      const content = conversation.last_message.is_deleted
        ? '[Nachricht gelöscht]'
        : conversation.last_message.content;

      const maxLength = 60;
      return content.length > maxLength
        ? `${content.substring(0, maxLength)}...`
        : content;
    }, [conversation.last_message]);

    return (
      <div
        className={`flex w-full cursor-pointer items-center space-x-3 border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 active:bg-gray-100 sm:p-4 ${
          isSelected ? 'border-indigo-200 bg-indigo-50' : ''
        }`}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <ProfileAvatar
            user={{
              id: otherParticipant?.user.id,
              display_name: participantName,
              profile_image_url: otherParticipant?.user.profile_image_url,
            }}
            size="md"
            className="flex-shrink-0"
          />
        </div>

        <div className="min-w-0 flex-1" onClick={onClick}>
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`truncate text-sm font-medium sm:text-base ${
                conversation.unread_count > 0
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {participantName}
            </h3>

            <div className="flex flex-shrink-0 items-center space-x-2">
              {conversation.last_message_at && (
                <span className="text-xs text-gray-500">
                  {formatTime(conversation.last_message_at)}
                </span>
              )}

              {conversation.unread_count > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-medium text-white">
                  {conversation.unread_count > 99
                    ? '99+'
                    : conversation.unread_count}
                </span>
              )}
            </div>
          </div>

          {conversation.last_message && (
            <p
              className={`mt-0.5 truncate text-sm ${
                conversation.unread_count > 0
                  ? 'font-medium text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              {conversation.last_message.sender.id === currentUserId && 'Du: '}
              {truncatedContent}
            </p>
          )}
        </div>

        {(otherParticipant?.is_muted || otherParticipant?.is_archived) && (
          <div className="flex flex-shrink-0 flex-col items-end space-y-1">
            {otherParticipant?.is_muted && (
              <VolumeX className="h-4 w-4 text-gray-400" />
            )}
            {otherParticipant?.is_archived && (
              <Archive className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </div>
    );
  });

ConversationListItem.displayName = 'ConversationListItem';
