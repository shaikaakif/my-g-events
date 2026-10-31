import {
  Profile,
  EventItem,
  EventMember,
  EventScheduleItem,
  Ticket,
  TicketUpdate,
  ChallengeContent,
  EventGalleryItem,
  EventFeedback,
} from '../../types';

export interface TicketFilterOptions {
  createdBy?: string;
  assignedTo?: string;
  eventId?: string;
  status?: string;
}

export interface IEventRepository {
  // Profiles
  getProfiles(): Promise<Profile[]>;
  getProfileById(id: string): Promise<Profile | null>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile>;

  // Events
  getEvents(): Promise<EventItem[]>;
  getEventById(id: string): Promise<EventItem | null>;
  createEvent(event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>): Promise<EventItem>;
  updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem>;

  // Registrations (Event Members)
  getRegistrations(participantId?: string, eventId?: string): Promise<EventMember[]>;
  registerForEvent(eventId: string, participantId: string): Promise<{ success: boolean; member?: EventMember; error?: string }>;
  cancelRegistration(memberId: string): Promise<boolean>;

  // Schedule
  getSchedules(eventId?: string): Promise<EventScheduleItem[]>;
  createScheduleItem(item: Omit<EventScheduleItem, 'id'>): Promise<EventScheduleItem>;
  updateScheduleItem(id: string, updates: Partial<EventScheduleItem>): Promise<EventScheduleItem>;
  deleteScheduleItem(id: string): Promise<boolean>;

  // Challenge content
  getChallengeContent(eventId: string): Promise<ChallengeContent | null>;
  saveChallengeContent(content: Omit<ChallengeContent, 'id' | 'updated_at'>): Promise<ChallengeContent>;

  // Support Tickets
  getTickets(filters?: TicketFilterOptions): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | null>;
  createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<Ticket>, updatedBy: string, updateNote?: string): Promise<Ticket>;
  getTicketUpdates(ticketId: string): Promise<TicketUpdate[]>;

  // Gallery
  getGalleryItems(eventId?: string): Promise<EventGalleryItem[]>;
  addGalleryItem(item: Omit<EventGalleryItem, 'id' | 'created_at'>): Promise<EventGalleryItem>;

  // Event Feedback
  getEventFeedbacks(eventId: string): Promise<EventFeedback[]>;
  addEventFeedback(feedback: Omit<EventFeedback, 'id' | 'created_at'>): Promise<EventFeedback>;

  // Local demo control
  resetDemoData?(): void;
}
