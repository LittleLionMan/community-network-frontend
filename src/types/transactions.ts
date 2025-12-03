export interface TransactionOfferInfo {
  offer_id: number;
  offer_type: string;
  title: string;
  thumbnail_url: string | null;
  condition: string | null;
  metadata: Record<string, unknown>;
}

export interface TransactionParticipantInfo {
  id: number;
  display_name: string;
  profile_image_url: string | null;
}

export interface TransactionData {
  transaction_id: number;
  transaction_type: 'book_exchange' | 'service_meetup' | 'event_confirmation';
  status: 'pending' | 'time_confirmed' | 'completed' | 'cancelled' | 'expired';
  offer: TransactionOfferInfo;
  requester: TransactionParticipantInfo;
  provider: TransactionParticipantInfo;
  proposed_times: string[];
  confirmed_time: string | null;
  exact_address: string | null;
  requester_confirmed: boolean;
  provider_confirmed: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
  is_expired: boolean;
  can_propose_time: boolean;
  can_confirm_time: boolean;
  can_edit_address: boolean;
  can_confirm_handover: boolean;
  can_cancel: boolean;
  metadata: Record<string, unknown>;
}

export interface TransactionCreateRequest {
  offer_type: string;
  offer_id: number;
  transaction_type: 'book_exchange' | 'service_meetup' | 'event_confirmation';
  initial_message: string;
  proposed_times?: string[];
}

export interface TransactionProposeTimeRequest {
  proposed_time: string;
}

export interface TransactionConfirmTimeRequest {
  confirmed_time: string;
  exact_address: string;
}

export interface TransactionCancelRequest {
  reason?: string;
}

export interface TransactionConfirmHandoverRequest {
  notes?: string;
}

export interface TransactionHistoryItem {
  id: number;
  transaction_type: 'book_exchange' | 'service_meetup' | 'event_confirmation';
  status: string;
  offer_title: string;
  offer_thumbnail: string | null;
  counterpart_name: string;
  counterpart_avatar: string | null;
  confirmed_time: string | null;
  created_at: string;
  updated_at: string;
}
