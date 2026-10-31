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
import {
  IEventRepository,
  TicketFilterOptions,
} from './types';
import {
  INITIAL_PROFILES,
  INITIAL_EVENTS,
  INITIAL_MEMBERS,
  INITIAL_SCHEDULES,
  INITIAL_CHALLENGES,
  INITIAL_TICKETS,
  INITIAL_TICKET_UPDATES,
  INITIAL_GALLERY_ITEMS,
  INITIAL_EVENT_FEEDBACKS,
} from './seedConstants';

const STORAGE_KEYS = {
  PROFILES: 'gevents_demo_profiles_v1',
  EVENTS: 'gevents_demo_events_v1',
  MEMBERS: 'gevents_demo_members_v1',
  SCHEDULES: 'gevents_demo_schedules_v1',
  CHALLENGES: 'gevents_demo_challenges_v1',
  TICKETS: 'gevents_demo_tickets_v1',
  TICKET_UPDATES: 'gevents_demo_ticket_updates_v1',
  GALLERY: 'gevents_demo_gallery_v1',
  FEEDBACKS: 'gevents_demo_feedbacks_v1',
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

export class LocalDemoRepository implements IEventRepository {
  private ensureInitialized(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      this.resetDemoData();
    }
  }

  public resetDemoData(): void {
    if (typeof window === 'undefined') return;
    setItem(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    setItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    setItem(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    setItem(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    setItem(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    setItem(STORAGE_KEYS.TICKET_UPDATES, INITIAL_TICKET_UPDATES);
    setItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_ITEMS);
    setItem(STORAGE_KEYS.FEEDBACKS, INITIAL_EVENT_FEEDBACKS);
  }

  // PROFILES
  async getProfiles(): Promise<Profile[]> {
    this.ensureInitialized();
    return getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const profiles = await this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Profile with ID ${id} not found`);
    }
    const updated: Profile = {
      ...profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    profiles[idx] = updated;
    setItem(STORAGE_KEYS.PROFILES, profiles);
    return updated;
  }

  // EVENTS
  async getEvents(): Promise<EventItem[]> {
    this.ensureInitialized();
    const events = getItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const members = getItem<EventMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const feedbacks = getItem<EventFeedback[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_EVENT_FEEDBACKS);

    // Compute registered counts and ratings
    return events.map((ev) => {
      const confirmedCount = members.filter(
        (m) => m.event_id === ev.id && m.registration_status === 'confirmed'
      ).length;
      const evFeedbacks = feedbacks.filter((f) => f.event_id === ev.id);
      const avgRating =
        evFeedbacks.length > 0
          ? Number((evFeedbacks.reduce((sum, f) => sum + f.rating, 0) / evFeedbacks.length).toFixed(1))
          : 5.0;

      return {
        ...ev,
        registered_count: confirmedCount,
        average_rating: avgRating,
        feedback_count: evFeedbacks.length,
      };
    });
  }

  async getEventById(id: string): Promise<EventItem | null> {
    const events = await this.getEvents();
    return events.find((e) => e.id === id) || null;
  }

  async createEvent(event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>): Promise<EventItem> {
    const events = getItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...event,
      id: generateId(),
      created_at: now,
      updated_at: now,
      registered_count: 0,
    };
    events.unshift(newEvent);
    setItem(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
    const events = getItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new Error(`Event with ID ${id} not found`);
    }
    const updated: EventItem = {
      ...events[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    events[idx] = updated;
    setItem(STORAGE_KEYS.EVENTS, events);
    return updated;
  }

  // REGISTRATIONS
  async getRegistrations(participantId?: string, eventId?: string): Promise<EventMember[]> {
    this.ensureInitialized();
    let members = getItem<EventMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const events = getItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    if (participantId) {
      members = members.filter((m) => m.participant_id === participantId);
    }
    if (eventId) {
      members = members.filter((m) => m.event_id === eventId);
    }

    return members.map((m) => ({
      ...m,
      event: events.find((e) => e.id === m.event_id),
      participant: profiles.find((p) => p.id === m.participant_id),
    }));
  }

  async registerForEvent(
    eventId: string,
    participantId: string
  ): Promise<{ success: boolean; member?: EventMember; error?: string }> {
    const events = getItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const members = getItem<EventMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const targetEvent = events.find((e) => e.id === eventId);

    if (!targetEvent) {
      return { success: false, error: 'Event not found.' };
    }

    // 1. Check if already registered
    const existing = members.find(
      (m) => m.event_id === eventId && m.participant_id === participantId && m.registration_status !== 'cancelled'
    );
    if (existing) {
      return { success: false, error: 'You are already registered for this event.' };
    }

    // 2. Check registration deadline
    const deadline = new Date(targetEvent.registration_deadline);
    if (!isNaN(deadline.getTime()) && new Date() > deadline) {
      return { success: false, error: 'Registration deadline has passed.' };
    }

    // 3. Check capacity
    const confirmedCount = members.filter(
      (m) => m.event_id === eventId && m.registration_status === 'confirmed'
    ).length;

    let status: 'confirmed' | 'waitlisted' = 'confirmed';
    if (confirmedCount >= targetEvent.capacity) {
      status = 'waitlisted';
    }

    const newMember: EventMember = {
      id: generateId(),
      event_id: eventId,
      participant_id: participantId,
      registration_status: status,
      registered_at: new Date().toISOString(),
      event: targetEvent,
    };

    members.unshift(newMember);
    setItem(STORAGE_KEYS.MEMBERS, members);

    return { success: true, member: newMember };
  }

  async cancelRegistration(memberId: string): Promise<boolean> {
    const members = getItem<EventMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx === -1) return false;

    members[idx].registration_status = 'cancelled';
    setItem(STORAGE_KEYS.MEMBERS, members);
    return true;
  }

  // SCHEDULES
  async getSchedules(eventId?: string): Promise<EventScheduleItem[]> {
    this.ensureInitialized();
    let schedules = getItem<EventScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    if (eventId) {
      schedules = schedules.filter((s) => s.event_id === eventId);
    }
    return schedules.sort((a, b) => a.sequence_number - b.sequence_number);
  }

  async createScheduleItem(item: Omit<EventScheduleItem, 'id'>): Promise<EventScheduleItem> {
    const schedules = getItem<EventScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    const newItem: EventScheduleItem = {
      ...item,
      id: generateId(),
    };
    schedules.push(newItem);
    setItem(STORAGE_KEYS.SCHEDULES, schedules);
    return newItem;
  }

  async updateScheduleItem(id: string, updates: Partial<EventScheduleItem>): Promise<EventScheduleItem> {
    const schedules = getItem<EventScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    const idx = schedules.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Schedule item not found');

    const updated = { ...schedules[idx], ...updates };
    schedules[idx] = updated;
    setItem(STORAGE_KEYS.SCHEDULES, schedules);
    return updated;
  }

  async deleteScheduleItem(id: string): Promise<boolean> {
    let schedules = getItem<EventScheduleItem[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    const initialLen = schedules.length;
    schedules = schedules.filter((s) => s.id !== id);
    if (schedules.length === initialLen) return false;
    setItem(STORAGE_KEYS.SCHEDULES, schedules);
    return true;
  }

  // CHALLENGE CONTENT
  async getChallengeContent(eventId: string): Promise<ChallengeContent | null> {
    this.ensureInitialized();
    const challenges = getItem<ChallengeContent[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    return challenges.find((c) => c.event_id === eventId) || null;
  }

  async saveChallengeContent(content: Omit<ChallengeContent, 'id' | 'updated_at'>): Promise<ChallengeContent> {
    const challenges = getItem<ChallengeContent[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    const existingIdx = challenges.findIndex((c) => c.event_id === content.event_id);
    const now = new Date().toISOString();

    if (existingIdx >= 0) {
      const updated: ChallengeContent = {
        ...challenges[existingIdx],
        ...content,
        updated_at: now,
      };
      challenges[existingIdx] = updated;
      setItem(STORAGE_KEYS.CHALLENGES, challenges);
      return updated;
    } else {
      const created: ChallengeContent = {
        ...content,
        id: generateId(),
        updated_at: now,
      };
      challenges.push(created);
      setItem(STORAGE_KEYS.CHALLENGES, challenges);
      return created;
    }
  }

  // TICKETS
  async getTickets(filters?: TicketFilterOptions): Promise<Ticket[]> {
    this.ensureInitialized();
    let tickets = getItem<Ticket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    const events = getItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    if (filters?.createdBy) {
      tickets = tickets.filter((t) => t.created_by === filters.createdBy);
    }
    if (filters?.assignedTo) {
      tickets = tickets.filter((t) => t.assigned_to === filters.assignedTo);
    }
    if (filters?.eventId) {
      tickets = tickets.filter((t) => t.event_id === filters.eventId);
    }
    if (filters?.status) {
      tickets = tickets.filter((t) => t.status === filters.status);
    }

    return tickets.map((t) => {
      const ev = events.find((e) => e.id === t.event_id);
      const creator = profiles.find((p) => p.id === t.created_by);
      const assignee = profiles.find((p) => p.id === t.assigned_to);
      return {
        ...t,
        event_title: ev?.title || 'Campus Event',
        created_by_name: creator?.full_name || 'Anonymous User',
        assigned_to_name: assignee ? assignee.full_name : 'Unassigned',
      };
    });
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const tickets = await this.getTickets();
    return tickets.find((t) => t.id === id) || null;
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
    const tickets = getItem<Ticket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...ticket,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    tickets.unshift(newTicket);
    setItem(STORAGE_KEYS.TICKETS, tickets);

    // Initial audit log
    const updates = getItem<TicketUpdate[]>(STORAGE_KEYS.TICKET_UPDATES, INITIAL_TICKET_UPDATES);
    updates.push({
      id: generateId(),
      ticket_id: newTicket.id,
      updated_by: newTicket.created_by,
      old_status: 'none',
      new_status: newTicket.status,
      note: 'Ticket created by user',
      created_at: now,
    });
    setItem(STORAGE_KEYS.TICKET_UPDATES, updates);

    return newTicket;
  }

  async updateTicket(
    id: string,
    updates: Partial<Ticket>,
    updatedBy: string,
    updateNote?: string
  ): Promise<Ticket> {
    const tickets = getItem<Ticket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    const idx = tickets.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Ticket with ID ${id} not found`);

    const oldStatus = tickets[idx].status;
    const now = new Date().toISOString();

    const updated: Ticket = {
      ...tickets[idx],
      ...updates,
      updated_at: now,
    };
    tickets[idx] = updated;
    setItem(STORAGE_KEYS.TICKETS, tickets);

    // Record history update
    const ticketUpdates = getItem<TicketUpdate[]>(STORAGE_KEYS.TICKET_UPDATES, INITIAL_TICKET_UPDATES);
    ticketUpdates.unshift({
      id: generateId(),
      ticket_id: id,
      updated_by: updatedBy,
      old_status: oldStatus,
      new_status: updated.status,
      note: updateNote || `Status updated from ${oldStatus} to ${updated.status}`,
      created_at: now,
    });
    setItem(STORAGE_KEYS.TICKET_UPDATES, ticketUpdates);

    return updated;
  }

  async getTicketUpdates(ticketId: string): Promise<TicketUpdate[]> {
    this.ensureInitialized();
    const updates = getItem<TicketUpdate[]>(STORAGE_KEYS.TICKET_UPDATES, INITIAL_TICKET_UPDATES);
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    return updates
      .filter((u) => u.ticket_id === ticketId)
      .map((u) => {
        const updater = profiles.find((p) => p.id === u.updated_by);
        return {
          ...u,
          updated_by_name: updater?.full_name || 'Staff Member',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // GALLERY
  async getGalleryItems(eventId?: string): Promise<EventGalleryItem[]> {
    this.ensureInitialized();
    const items = getItem<EventGalleryItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_ITEMS);
    if (!eventId || eventId === 'all') {
      return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return items
      .filter((i) => i.event_id === eventId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addGalleryItem(item: Omit<EventGalleryItem, 'id' | 'created_at'>): Promise<EventGalleryItem> {
    this.ensureInitialized();
    const items = getItem<EventGalleryItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_ITEMS);
    const newItem: EventGalleryItem = {
      ...item,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    items.unshift(newItem);
    setItem(STORAGE_KEYS.GALLERY, items);
    return newItem;
  }

  // EVENT FEEDBACKS
  async getEventFeedbacks(eventId: string): Promise<EventFeedback[]> {
    this.ensureInitialized();
    const all = getItem<EventFeedback[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_EVENT_FEEDBACKS);
    return all
      .filter((f) => f.event_id === eventId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addEventFeedback(feedback: Omit<EventFeedback, 'id' | 'created_at'>): Promise<EventFeedback> {
    this.ensureInitialized();
    const all = getItem<EventFeedback[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_EVENT_FEEDBACKS);
    const newFeedback: EventFeedback = {
      ...feedback,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    all.unshift(newFeedback);
    setItem(STORAGE_KEYS.FEEDBACKS, all);
    return newFeedback;
  }
}
