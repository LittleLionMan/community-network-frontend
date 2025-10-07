export interface User {
  id: number;
  display_name: string;
  profile_image_url?: string;
}

export interface MessageUser {
  id: number;
  display_name: string;
}

export interface Message {
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

export interface ConversationParticipant {
  user: MessageUser;
  joined_at: string;
  last_read_at?: string;
  is_muted: boolean;
  is_archived: boolean;
}

export interface Conversation {
  id: number;
  participants: ConversationParticipant[];
  last_message?: Message;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
  has_more: boolean;
}

export interface CreateConversationData {
  participant_id: number;
  initial_message: string;
}

export interface CreateMessageData {
  content: string;
  reply_to_id?: number;
}

export interface UpdateMessageData {
  content: string;
}

export interface ConversationSettings {
  is_muted?: boolean;
  is_archived?: boolean;
}

export interface MessagePrivacySettings {
  messages_enabled?: boolean;
  messages_from_strangers?: boolean;
  messages_notifications?: boolean;
}

export interface UnreadCount {
  total_unread: number;
  conversations: Array<{
    conversation_id: number;
    unread_count: number;
  }>;
}

export interface WebSocketMessageData {
  unread_count?: UnreadCount;
  read_up_to?: number;
  action?: string;
  token_expires_in?: number;
  auth_error?: string;
  reconnect_required?: boolean;
  [key: string]: unknown;
}

export interface WebSocketMessage {
  type:
    | 'new_message'
    | 'message_edited'
    | 'message_deleted'
    | 'messages_read'
    | 'typing_status'
    | 'unread_count_update'
    | 'heartbeat'
    | 'heartbeat_ack'
    | 'refresh_token'
    | 'token_refreshed'
    | 'token_refresh_failed'
    | 'token_expiring'
    | 'ping'
    | 'pong'
    | 'forum_reply'
    | 'forum_mention'
    | 'forum_quote';
  conversation_id?: number;
  message?: Message;
  user_id?: number;
  data?: UnreadCount | WebSocketMessageData;
  typing_users?: number[];
  total_unread?: number;
  message_id?: number;
  token?: string;
  success?: boolean;
  expires_in?: number;
  timestamp?: number;
  notification_id?: number;
  thread_id?: number;
  post_id?: number;
  thread_title?: string;
  actor?: {
    id: number;
    display_name: string;
    email: string;
    profile_image_url?: string;
  };
  quoted_post_id?: number;
}

export interface TypingStatus {
  conversation_id: number;
  typing_users: number[];
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}
