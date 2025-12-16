export interface ServiceCreateData {
  title: string;
  description: string;
  is_offering: boolean;
  meeting_locations?: string[];
  price_type?: 'free' | 'paid' | 'negotiable' | 'exchange';
  price_amount?: number;
  estimated_duration_hours?: number;
  contact_method?: 'message' | 'phone' | 'email';
  response_time_hours?: number;
  service_image?: File;
}

export interface ServiceUpdateData {
  title?: string;
  description?: string;
  is_offering?: boolean;
  is_active?: boolean;
  service_image?: File | null;
  meeting_locations?: string[];
  price_type?: 'free' | 'paid' | 'negotiable' | 'exchange';
  price_amount?: number;
  estimated_duration_hours?: number;
  contact_method?: 'message' | 'phone' | 'email';
  response_time_hours?: number;
  is_completed?: boolean;
}

export interface Service {
  id: number;
  slug?: string;
  title: string;
  description: string;
  is_offering: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  service_image_url?: string;
  service_type?: 'user_service' | 'platform_feature';
  meeting_locations?: string[];
  view_count: number;
  interest_count: number;
  is_completed: boolean;
  completed_at?: string;
  price_type?: 'free' | 'paid' | 'negotiable' | 'exchange';
  price_amount?: number;
  price_currency: string;
  estimated_duration_hours?: number;
  contact_method: 'message' | 'phone' | 'email';
  response_time_hours?: number;
  user: {
    id: number;
    display_name: string;
    profile_image_url?: string;
    email_verified: boolean;
    created_at: string;
    location?: string;
    exact_address_private: boolean;
  };
}

export interface ServiceStats {
  total_active_services: number;
  services_offered: number;
  services_requested: number;
  market_balance: number;
  services_with_images_percent: number;
  services_with_locations_percent: number;
  average_response_time_hours: number;
  completion_rate_percent: number;
  average_rating: number;
  user_stats?: {
    my_services: number;
    my_offerings: number;
    my_requests: number;
    my_services_with_images: number;
    my_services_with_locations: number;
    total_interests_received: number;
    completion_rate: number;
    average_rating: number;
    response_time_hours: number;
  };
}

export interface ServiceInterestData {
  message: string;
  proposed_meeting_location?: string;
  proposed_meeting_time?: Date;
}

export interface ServiceInterestResponseData {
  status: 'accepted' | 'declined';
  response_message?: string;
  agreed_meeting_location?: string;
  agreed_meeting_time?: Date;
}

export interface ServiceCompletionData {
  completion_notes?: string;
  rating?: number;
  review_text?: string;
  is_review_public?: boolean;
}

export interface ServiceRatingData {
  rating: number;
  review_text?: string;
  is_public?: boolean;
}

export interface ServiceSearchFilters {
  search?: string;
  is_offering?: boolean;
  price_type?: 'free' | 'paid' | 'negotiable' | 'exchange';
  max_price?: number;
  max_duration_hours?: number;
  has_image?: boolean;
  has_meeting_locations?: boolean;
  completed_only?: boolean;
  exclude_own?: boolean;
  near_location?: string;
  max_distance_km?: number;
}
