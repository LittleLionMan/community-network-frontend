import { TransactionData } from '@/types/transactions';

export function parseTransactionData(
  flatData: Record<string, string | number | boolean | null>
): TransactionData {
  const proposedTimesStr = flatData.proposed_times as string;
  const proposedTimes = proposedTimesStr
    ? proposedTimesStr.split(',').filter(Boolean)
    : [];

  return {
    transaction_id: flatData.transaction_id as number,
    transaction_type: flatData.transaction_type as
      | 'book_exchange'
      | 'service_meetup'
      | 'event_confirmation',
    status: flatData.status as
      | 'pending'
      | 'time_confirmed'
      | 'completed'
      | 'cancelled'
      | 'expired',
    offer: {
      offer_id: flatData.offer_id as number,
      offer_type: flatData.offer_type as string,
      title: flatData.offer_title as string,
      thumbnail_url: (flatData.offer_thumbnail_url as string) || null,
      condition: (flatData.offer_condition as string) || null,
      metadata: {},
    },
    requester: {
      id: flatData.requester_id as number,
      display_name: flatData.requester_display_name as string,
      profile_image_url:
        (flatData.requester_profile_image_url as string) || null,
    },
    provider: {
      id: flatData.provider_id as number,
      display_name: flatData.provider_display_name as string,
      profile_image_url:
        (flatData.provider_profile_image_url as string) || null,
    },
    proposed_times: proposedTimes,
    confirmed_time: (flatData.confirmed_time as string) || null,
    exact_address: (flatData.exact_address as string) || null,
    location_district: (flatData.location_district as string) || null,
    requester_confirmed: flatData.requester_confirmed as boolean,
    provider_confirmed: flatData.provider_confirmed as boolean,
    created_at: flatData.created_at as string,
    updated_at: flatData.updated_at as string,
    expires_at: flatData.expires_at as string,
    is_expired: flatData.is_expired as boolean,
    can_propose_time: flatData.can_propose_time as boolean,
    can_confirm_time: flatData.can_confirm_time as boolean,
    can_edit_address: flatData.can_edit_address as boolean,
    can_confirm_handover: flatData.can_confirm_handover as boolean,
    can_cancel: flatData.can_cancel as boolean,
    metadata: {},
  };
}
