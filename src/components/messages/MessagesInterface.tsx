import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MoreHorizontal,
  Edit3,
  Trash2,
  Reply,
  Check,
  CheckCheck,
  MessageCircle,
  X,
  Archive,
  VolumeX,
  Volume2,
  Phone,
  Video,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface MessageUser {
  id: number;
  display_name: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender: MessageUser;
  content: string;
  message_type: string;
  created_at: string;
  edited_at?: string;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to_id?: number;
  reply_to?: Message;
  is_read: boolean;
}

interface ConversationParticipant {
  user: MessageUser;
  joined_at: string;
  last_read_at?: string;
  is_muted: boolean;
  is_archived: boolean;
}

interface Conversation {
  id: number;
  participants: ConversationParticipant[];
  last_message?: Message;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface MessagesInterfaceProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  currentUserId: number;
  typingUsers?: MessageUser[];
  onSelectConversation: (conversation: Conversation) => void;
  onSendMessage: (content: string, replyToId?: number) => void;
  onEditMessage: (messageId: number, content: string) => void;
  onDeleteMessage: (messageId: number) => void;
  onLoadMoreMessages?: () => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  isLoading?: boolean;
  hasMoreMessages?: boolean;
}

interface MessageItemProps {
  message: Message;
  currentUserId: number;
  onEdit?: (messageId: number, content: string) => void;
  onDelete?: (messageId: number) => void;
  onReply?: (message: Message) => void;
  isConsecutive?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  isConsecutive = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.sender.id === currentUserId;
  const canEdit = isOwnMessage && !message.is_deleted;
  const canDelete = isOwnMessage && !message.is_deleted;

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  return (
    <div
      className={`group flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
        isConsecutive ? 'mt-1' : 'mt-4'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-[70%] items-end sm:max-w-[80%]`}
      >
        {!isConsecutive && (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-sm font-medium text-white ${isOwnMessage ? 'ml-2' : 'mr-2'}`}
          >
            {message.sender.display_name.charAt(0).toUpperCase()}
          </div>
        )}

        <div
          className={`relative ${isConsecutive && !isOwnMessage ? 'ml-10' : ''} ${isConsecutive && isOwnMessage ? 'mr-10' : ''}`}
        >
          {message.reply_to && (
            <div
              className={`mb-1 text-xs text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center space-x-1">
                <Reply className="h-3 w-3" />
                <span>Antwort an {message.reply_to.sender.display_name}</span>
              </div>
              <div className="max-w-xs truncate italic opacity-75">
                {message.reply_to.content}
              </div>
            </div>
          )}

          <div
            className={`relative rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            } ${message.is_deleted ? 'italic opacity-60' : ''}`}
          >
            {!isOwnMessage && !isConsecutive && (
              <div className="mb-1 text-xs font-medium text-gray-600">
                {message.sender.display_name}
              </div>
            )}

            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleEdit}
                className="w-full resize-none border-none bg-transparent outline-none"
                autoFocus
                rows={Math.min(editContent.split('\n').length, 4)}
              />
            ) : (
              <div className="whitespace-pre-wrap break-words">
                {message.is_deleted ? '[Nachricht gelöscht]' : message.content}
              </div>
            )}

            <div
              className={`mt-1 flex items-center justify-between text-xs ${
                isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
              }`}
            >
              <span>
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
                {message.is_edited && ' (bearbeitet)'}
              </span>

              {isOwnMessage && (
                <div className="flex items-center space-x-1">
                  {message.is_read ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </div>
              )}
            </div>
          </div>

          {showActions && !isEditing && !message.is_deleted && (
            <div
              className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items-center space-x-1 rounded-lg border bg-white p-1 shadow-lg`}
            >
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="rounded p-1 text-gray-600 hover:bg-gray-100"
                  title="Antworten"
                >
                  <Reply className="h-4 w-4" />
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded p-1 text-gray-600 hover:bg-gray-100"
                  title="Bearbeiten"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}

              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="rounded p-1 text-red-600 hover:bg-red-100"
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageInputProps {
  onSend: (content: string, replyToId?: number) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  onStopTyping,
  replyToMessage,
  onCancelReply,
  disabled = false,
  placeholder = 'Nachricht schreiben...',
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim(), replyToMessage?.id);
      setContent('');
      onStopTyping?.();

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (onTyping) {
      onTyping();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t bg-white p-4">
      {replyToMessage && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-2">
            <Reply className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Antwort an {replyToMessage.sender.display_name}
              </div>
              <div className="max-w-xs truncate text-sm text-gray-600">
                {replyToMessage.content}
              </div>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end space-x-3">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: number;
  isSelected?: boolean;
  onClick: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  isSelected = false,
  onClick,
}) => {
  const otherParticipant = conversation.participants.find(
    (p) => p.user.id !== currentUserId
  );
  const participantName = otherParticipant?.user.display_name || 'Unbekannt';

  const formatTime = (dateString: string) => {
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
  };

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center space-x-3 border-b border-gray-100 p-4 hover:bg-gray-50 ${
        isSelected ? 'border-indigo-200 bg-indigo-50' : ''
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 font-medium text-white">
        {participantName.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3
            className={`truncate text-sm font-medium ${
              conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-600'
            }`}
          >
            {participantName}
          </h3>

          <div className="flex items-center space-x-2">
            {conversation.last_message_at && (
              <span className="text-xs text-gray-500">
                {formatTime(conversation.last_message_at)}
              </span>
            )}

            {conversation.unread_count > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-medium text-white">
                {conversation.unread_count > 99
                  ? '99+'
                  : conversation.unread_count}
              </span>
            )}
          </div>
        </div>

        {conversation.last_message && (
          <p
            className={`truncate text-sm ${
              conversation.unread_count > 0
                ? 'font-medium text-gray-900'
                : 'text-gray-500'
            }`}
          >
            {conversation.last_message.sender.id === currentUserId && 'Du: '}
            {conversation.last_message.is_deleted
              ? '[Nachricht gelöscht]'
              : conversation.last_message.content}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end space-y-1">
        {otherParticipant?.is_muted && (
          <VolumeX className="h-4 w-4 text-gray-400" />
        )}
        {otherParticipant?.is_archived && (
          <Archive className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  typingUsers: MessageUser[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].display_name} schreibt...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].display_name} und ${typingUsers[1].display_name} schreiben...`;
    } else {
      return `${typingUsers.length} Personen schreiben...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm italic text-gray-500">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div
            className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
        <span>{getTypingText()}</span>
      </div>
    </div>
  );
};

interface ConversationHeaderProps {
  conversation: Conversation;
  currentUserId: number;
  onToggleMute?: () => void;
  onToggleArchive?: () => void;
  onClose?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  currentUserId,
  onToggleMute,
  onToggleArchive,
  onClose,
  showBackButton = false,
  onBack,
}) => {
  const [showActions, setShowActions] = useState(false);
  const otherParticipant = conversation.participants.find(
    (p) => p.user.id !== currentUserId
  );
  const participantName = otherParticipant?.user.display_name || 'Unbekannt';

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center space-x-3">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="mr-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 font-medium text-white">
          {participantName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {participantName}
          </h2>
          <p className="text-sm text-gray-500">Online vor 2h</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Phone className="h-5 w-5" />
        </button>

        <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Video className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showActions && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                onClick={() => {
                  onToggleMute?.();
                  setShowActions(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {otherParticipant?.is_muted ? (
                  <>
                    <Volume2 className="mr-3 h-4 w-4" />
                    Stummschaltung aufheben
                  </>
                ) : (
                  <>
                    <VolumeX className="mr-3 h-4 w-4" />
                    Stummschalten
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onToggleArchive?.();
                  setShowActions(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Archive className="mr-3 h-4 w-4" />
                {otherParticipant?.is_archived
                  ? 'Aus Archiv entfernen'
                  : 'Archivieren'}
              </button>

              <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Info className="mr-3 h-4 w-4" />
                Conversation Info
              </button>
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const MessagesInterface: React.FC<MessagesInterfaceProps> = ({
  conversations,
  selectedConversation,
  messages,
  currentUserId,
  typingUsers = [],
  onSelectConversation,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onLoadMoreMessages,
  onTyping,
  onStopTyping,
  isLoading = false,
  hasMoreMessages = false,
}) => {
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showMobileConversationList, setShowMobileConversationList] =
    useState(!selectedConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setShowMobileConversationList(!selectedConversation);
  }, [selectedConversation]);

  const handleSendMessage = (content: string, replyToId?: number) => {
    onSendMessage(content, replyToId);
    setReplyToMessage(null);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    setShowMobileConversationList(false);
  };

  const handleBackToList = () => {
    setShowMobileConversationList(true);
  };

  const isConsecutiveMessage = (message: Message, index: number) => {
    if (index === 0) return false;
    const prevMessage = messages[index - 1];
    return (
      prevMessage.sender.id === message.sender.id &&
      new Date(message.created_at).getTime() -
        new Date(prevMessage.created_at).getTime() <
        300000 // 5 minutes
    );
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="hidden w-80 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">Nachrichten</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p>Keine Conversations gefunden</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`w-full transition-transform duration-300 md:hidden ${
          showMobileConversationList ? 'translate-x-0' : '-translate-x-full'
        } absolute inset-0 bg-white`}
      >
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">Nachrichten</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p>Keine Conversations gefunden</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col transition-transform duration-300 md:translate-x-0 ${
          !showMobileConversationList
            ? 'translate-x-0'
            : 'translate-x-full md:translate-x-0'
        } ${showMobileConversationList ? 'absolute inset-0 md:relative' : ''}`}
      >
        {selectedConversation ? (
          <>
            <ConversationHeader
              conversation={selectedConversation}
              currentUserId={currentUserId}
              showBackButton={true}
              onBack={handleBackToList}
            />

            <div className="flex-1 space-y-1 overflow-y-auto p-4">
              {hasMoreMessages && (
                <div className="py-4 text-center">
                  <button
                    onClick={onLoadMoreMessages}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Ältere Nachrichten laden
                  </button>
                </div>
              )}

              {messages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUserId={currentUserId}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  onReply={setReplyToMessage}
                  isConsecutive={isConsecutiveMessage(message, index)}
                />
              ))}

              {typingUsers.length > 0 && (
                <TypingIndicator typingUsers={typingUsers} />
              )}

              <div ref={messagesEndRef} />
            </div>

            <MessageInput
              onSend={handleSendMessage}
              onTyping={onTyping}
              onStopTyping={onStopTyping}
              replyToMessage={replyToMessage}
              onCancelReply={() => setReplyToMessage(null)}
              disabled={isLoading}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h2 className="mb-2 text-xl font-medium text-gray-900">
                Wähle eine Conversation
              </h2>
              <p className="text-gray-600">
                Wähle eine Conversation aus der Liste oder starte eine neue
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesInterface;
