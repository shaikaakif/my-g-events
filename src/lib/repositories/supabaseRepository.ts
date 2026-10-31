import { getSupabaseClient } from '../supabase/client';
import {
  Profile,
  EventItem,
  EventMember,
  EventScheduleItem,
  Ticket,
  TicketUpdate,
  ChallengeContent,
} from '../../types';
import { IEventRepository, TicketFilterOptions } from './types';

export class SupabaseRepository implements IEventRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error(
        'Supabase client is not configured. Please supply valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }
    return client;
  }

  async getProfiles(): Promise<Profile[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (error) throw new Error(`Supabase error fetching profiles: ${error.message}`);
    return data as Profile[];
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Supabase error fetching profile ${id}: ${error.message}`);
    return data as Profile | null;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Supabase error updating profile: ${error.message}`);
    return data as Profile;
  }

  async getEvents(): Promise<EventItem[]> {
    const supabase = this.getClient();
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (eventError) throw new Error(`Supabase error fetching events: ${eventError.message}`);

    // Fetch confirmed member counts
    const { data: members, error: memError } = await supabase
      .from('event_members')
      .select('event_id')
      .eq('registration_status', 'confirmed');

    const counts: Record<string, number> = {};
    if (!memError && members) {
      for (const m of members) {
        counts[m.event_id] = (counts[m.event_id] || 0) + 1;
      }
    }

    return (events as EventItem[]).map((ev) => ({
      ...ev,
      registered_count: counts[ev.id] || 0,
    }));
  }

  async getEventById(id: string): Promise<EventItem | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Supabase error fetching event ${id}: ${error.message}`);
    if (!data) return null;

    const { count } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('registration_status', 'confirmed');

    return {
      ...(data as EventItem),
      registered_count: count || 0,
    };
  }

  async createEvent(event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>): Promise<EventItem> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating event: ${error.message}`);
    return data as EventItem;
  }

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error updating event: ${error.message}`);
    return data as EventItem;
  }

  async getRegistrations(participantId?: string, eventId?: string): Promise<EventMember[]> {
    const supabase = this.getClient();
    let query = supabase.from('event_members').select('*, event:events(*), participant:profiles(*)');

    if (participantId) {
      query = query.eq('participant_id', participantId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query.order('registered_at', { ascending: false });
    if (error) throw new Error(`Supabase error fetching registrations: ${error.message}`);
    return data as EventMember[];
  }

  async registerForEvent(
    eventId: string,
    participantId: string
  ): Promise<{ success: boolean; member?: EventMember; error?: string }> {
    const supabase = this.getClient();

    // 1. Check existing
    const { data: existing } = await supabase
      .from('event_members')
      .select('*')
      .eq('event_id', eventId)
      .eq('participant_id', participantId)
      .neq('registration_status', 'cancelled')
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'You are already registered for this event.' };
    }

    // 2. Fetch event to check capacity and deadline
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return { success: false, error: 'Event details could not be verified.' };
    }

    const deadline = new Date(event.registration_deadline);
    if (!isNaN(deadline.getTime()) && new Date() > deadline) {
      return { success: false, error: 'Registration deadline has passed.' };
    }

    const { count } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('registration_status', 'confirmed');

    const confirmedCount = count || 0;
    const status = confirmedCount >= event.capacity ? 'waitlisted' : 'confirmed';

    const { data: member, error: insertErr } = await supabase
      .from('event_members')
      .insert([
        {
          event_id: eventId,
          participant_id: participantId,
          registration_status: status,
        },
      ])
      .select('*, event:events(*)')
      .single();

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    return { success: true, member: member as EventMember };
  }

  async cancelRegistration(memberId: string): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase
      .from('event_members')
      .update({ registration_status: 'cancelled' })
      .eq('id', memberId);

    if (error) throw new Error(`Supabase error cancelling registration: ${error.message}`);
    return true;
  }

  async getSchedules(eventId?: string): Promise<EventScheduleItem[]> {
    const supabase = this.getClient();
    let query = supabase.from('event_schedule').select('*').order('sequence_number', { ascending: true });
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Supabase error fetching schedule: ${error.message}`);
    return data as EventScheduleItem[];
  }

  async createScheduleItem(item: Omit<EventScheduleItem, 'id'>): Promise<EventScheduleItem> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from('event_schedule').insert([item]).select().single();
    if (error) throw new Error(`Supabase error creating schedule item: ${error.message}`);
    return data as EventScheduleItem;
  }

  async updateScheduleItem(id: string, updates: Partial<EventScheduleItem>): Promise<EventScheduleItem> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('event_schedule')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Supabase error updating schedule: ${error.message}`);
    return data as EventScheduleItem;
  }

  async deleteScheduleItem(id: string): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase.from('event_schedule').delete().eq('id', id);
    if (error) throw new Error(`Supabase error deleting schedule item: ${error.message}`);
    return true;
  }

  async getChallengeContent(eventId: string): Promise<ChallengeContent | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('challenge_content')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw new Error(`Supabase error fetching challenge content: ${error.message}`);
    return data as ChallengeContent | null;
  }

  async saveChallengeContent(content: Omit<ChallengeContent, 'id' | 'updated_at'>): Promise<ChallengeContent> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('challenge_content')
      .upsert(
        {
          ...content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'event_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Supabase error saving challenge content: ${error.message}`);
    return data as ChallengeContent;
  }

  async getTickets(filters?: TicketFilterOptions): Promise<Ticket[]> {
    const supabase = this.getClient();
    let query = supabase
      .from('tickets')
      .select('*, event:events(title), creator:profiles!created_by(full_name), assignee:profiles!assigned_to(full_name)')
      .order('created_at', { ascending: false });

    if (filters?.createdBy) query = query.eq('created_by', filters.createdBy);
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters?.eventId) query = query.eq('event_id', filters.eventId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new Error(`Supabase error fetching tickets: ${error.message}`);

    // Map nested joined fields to top-level helpers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((t: any) => ({
      id: t.id,
      event_id: t.event_id,
      created_by: t.created_by,
      assigned_to: t.assigned_to,
      category: t.category,
      subject: t.subject,
      description: t.description,
      priority: t.priority,
      status: t.status,
      resolution_note: t.resolution_note,
      created_at: t.created_at,
      updated_at: t.updated_at,
      event_title: t.event?.title || 'Campus Event',
      created_by_name: t.creator?.full_name || 'Participant',
      assigned_to_name: t.assignee?.full_name || 'Unassigned',
    }));
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const supabase = this.getClient();
    const { data: t, error } = await supabase
      .from('tickets')
      .select('*, event:events(title), creator:profiles!created_by(full_name), assignee:profiles!assigned_to(full_name)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Supabase error fetching ticket ${id}: ${error.message}`);
    if (!t) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = t as any;
    return {
      id: row.id,
      event_id: row.event_id,
      created_by: row.created_by,
      assigned_to: row.assigned_to,
      category: row.category,
      subject: row.subject,
      description: row.description,
      priority: row.priority,
      status: row.status,
      resolution_note: row.resolution_note,
      created_at: row.created_at,
      updated_at: row.updated_at,
      event_title: row.event?.title || 'Campus Event',
      created_by_name: row.creator?.full_name || 'Participant',
      assigned_to_name: row.assignee?.full_name || 'Unassigned',
    };
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
    const supabase = this.getClient();
    const { data: newTicket, error } = await supabase
      .from('tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating ticket: ${error.message}`);

    // Insert initial update record
    await supabase.from('ticket_updates').insert([
      {
        ticket_id: newTicket.id,
        updated_by: newTicket.created_by,
        old_status: 'none',
        new_status: newTicket.status,
        note: 'Ticket created by user',
      },
    ]);

    return newTicket as Ticket;
  }

  async updateTicket(
    id: string,
    updates: Partial<Ticket>,
    updatedBy: string,
    updateNote?: string
  ): Promise<Ticket> {
    const supabase = this.getClient();
    const current = await this.getTicketById(id);
    if (!current) throw new Error(`Ticket with ID ${id} not found`);

    const { data, error } = await supabase
      .from('tickets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error updating ticket: ${error.message}`);

    // Insert ticket update history log
    await supabase.from('ticket_updates').insert([
      {
        ticket_id: id,
        updated_by: updatedBy,
        old_status: current.status,
        new_status: updates.status || current.status,
        note: updateNote || `Status changed from ${current.status} to ${updates.status || current.status}`,
      },
    ]);

    return data as Ticket;
  }

  async getTicketUpdates(ticketId: string): Promise<TicketUpdate[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('ticket_updates')
      .select('*, updater:profiles!updated_by(full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase error fetching ticket updates: ${error.message}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((u: any) => ({
      id: u.id,
      ticket_id: u.ticket_id,
      updated_by: u.updated_by,
      updated_by_name: u.updater?.full_name || 'Staff Member',
      old_status: u.old_status,
      new_status: u.new_status,
      note: u.note,
      created_at: u.created_at,
    }));
  }
}
