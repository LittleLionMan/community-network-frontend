export type AvailabilitySlotType = 'available' | 'blocked';
export type AvailabilitySource = 'manual' | 'transaction' | 'event';

export interface AvailabilitySlotBase {
  slot_type: AvailabilitySlotType;
  title?: string;
  notes?: string;
  is_active: boolean;
}

export interface RecurringAvailabilitySlot extends AvailabilitySlotBase {
  day_of_week: number;
  start_time: string;
  end_time: string;
  specific_date?: never;
  specific_start?: never;
  specific_end?: never;
}

export interface SpecificAvailabilitySlot extends AvailabilitySlotBase {
  specific_date: string;
  specific_start: string;
  specific_end: string;
  day_of_week?: never;
  start_time?: never;
  end_time?: never;
}

export type AvailabilitySlotCreate =
  | RecurringAvailabilitySlot
  | SpecificAvailabilitySlot;

export interface AvailabilitySlotUpdate {
  slot_type?: AvailabilitySlotType;
  title?: string;
  notes?: string;
  is_active?: boolean;
}

export interface AvailabilitySlotRead extends AvailabilitySlotBase {
  id: number;
  user_id: number;
  source: AvailabilitySource;
  source_id?: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  specific_date?: string;
  specific_start?: string;
  specific_end?: string;
  created_at: string;
}

export interface AvailabilitySlotPublic {
  id: number;
  slot_type: AvailabilitySlotType;
  title?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  specific_date?: string;
  specific_start?: string;
  specific_end?: string;
  created_at: string;
}

export interface AvailabilityCheckRequest {
  proposed_time: string;
  duration_hours?: number;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  conflicts?: AvailabilitySlotRead[];
}
