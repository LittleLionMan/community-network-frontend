export type NotificationType = 'forum_reply' | 'forum_mention' | 'forum_quote';

export interface NotificationActor {
  id: number;
  display_name: string;
  email: string;
  profile_image_url?: string;
}

export interface NotificationData {
  thread_id: number;
  post_id: number;
  thread_title: string;
  content_preview: string;
  actor: NotificationActor;
  quoted_post_id?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  data: NotificationData;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total_unread: number;
  unread_by_type: Partial<Record<NotificationType, number>>;
  latest_notifications: Notification[];
}

export interface NotificationUpdate {
  is_read: boolean;
}

export interface ForumNotificationWSMessage {
  type: 'forum_reply' | 'forum_mention' | 'forum_quote';
  notification_id: number;
  thread_id: number;
  post_id: number;
  thread_title: string;
  message: string;
  actor: NotificationActor;
  quoted_post_id?: number;
}

export interface NotificationPrivacySettings {
  forum_reply_enabled: boolean;
  forum_mention_enabled: boolean;
  forum_quote_enabled: boolean;
}
