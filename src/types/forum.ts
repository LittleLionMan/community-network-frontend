export interface UserSummary {
  id: number;
  display_name: string;
  profile_image_url?: string;
}

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  thread_count: number;
  latest_thread?: ForumThreadSummary;
  latest_activity_thread?: ForumThreadSummary;
  latest_activity_post?: ForumPostSummary;
  latest_activity_at?: string;
}

export interface ForumThreadSummary {
  id: number;
  title: string;
  created_at: string;
  creator: UserSummary;
}

export interface ForumPostSummary {
  id: number;
  content: string;
  created_at: string;
  author: UserSummary;
}

export interface ForumThread {
  id: number;
  title: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  creator: UserSummary;
  category: ForumCategory;
  post_count: number;
  latest_post?: string;
  latest_post_author?: UserSummary;
}

export interface QuotedPostSummary {
  id: number;
  content: string;
  created_at: string;
  author: UserSummary;
  thread_id: number;
  quoted_post?: QuotedPostSummary | null;
}

export interface ForumPost {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  author: UserSummary;
  thread_id: number;
  quoted_post?: QuotedPostSummary | null;
  mentioned_user_ids?: number[] | null;
  has_achievement?: boolean;
}

export interface ForumCategoryCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
}

export interface ForumCategoryUpdate {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ForumThreadCreate {
  title: string;
  category_id: number;
}

export interface ForumThreadUpdate {
  title?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  category_id?: number;
}

export interface ForumPostCreate {
  content: string;
  quoted_post_id?: number | null;
}

export interface ForumPostUpdate {
  content: string;
}

export interface ThreadPostsParams {
  skip?: number;
  limit?: number;
  check_achievement?: string;
}
