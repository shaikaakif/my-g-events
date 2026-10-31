export type UserRole = 'participant' | 'volunteer' | 'coordinator' | 'principal';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
}

export type EventStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled' | 'archived';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  capacity: number;
  status: EventStatus;
  cover_image: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed / joined helpers
  registered_count?: number;
}

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface EventMember {
  id: string;
  event_id: string;
  participant_id: string;
  registration_status: RegistrationStatus;
  registered_at: string;
  // Joined fields for display
  event?: EventItem;
  participant?: Profile;
}

export interface EventScheduleItem {
  id: string;
  event_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  venue: string;
  sequence_number: number;
  day?: number; // Day 1 or Day 2
  is_break?: boolean; // Breaks (food, lunch, networking) vs non-break
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'acknowledged' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

export type TicketCategory =
  | 'Participant Help'
  | 'Volunteer Support'
  | 'Additional Volunteers'
  | 'Resources / Materials'
  | 'Venue / Schedule Issue'
  | 'Technical'
  | 'Registration'
  | 'Other';

export interface Ticket {
  id: string;
  event_id: string;
  created_by: string;
  assigned_to: string | null;
  category: TicketCategory | string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for convenience
  event_title?: string;
  created_by_name?: string;
  assigned_to_name?: string;
}

export interface TicketUpdate {
  id: string;
  ticket_id: string;
  updated_by: string;
  updated_by_name?: string;
  old_status: string;
  new_status: string;
  note: string;
  created_at: string;
}

export interface ChallengeResource {
  title: string;
  url: string;
  type: 'doc' | 'github' | 'dataset' | 'guide';
}

export interface ChallengeContent {
  id: string;
  event_id: string;
  title: string;
  problem_statement: string;
  objectives: string[];
  rules: string[];
  resources: ChallengeResource[];
  updated_at: string;
}

export type DataMode = 'demo' | 'supabase';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}
