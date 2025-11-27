export interface User {
  id: number;
  display_name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  location_lat?: number;
  location_lon?: number;
  location_district?: string;
  book_credits_remaining: number;
  book_credits_last_reset?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  email_verified: boolean;
  email_verified_at?: string;
  profile_image_url?: string | null;

  email_private: boolean;
  first_name_private: boolean;
  last_name_private: boolean;
  bio_private: boolean;
  location_private: boolean;
  created_at_private: boolean;

  email_notifications_events: boolean;
  email_notifications_messages: boolean;
  email_notifications_newsletter: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  location?: string;
  participant_count: number;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  is_offering: boolean;
}
