import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { EventItem, EventScheduleItem, Ticket } from '../../types';
import { TicketList } from '../tickets/TicketList';
import { ScheduleTimeline } from '../schedule/ScheduleTimeline';
import { ProfileView } from '../profile/ProfileView';
import { EmptyState } from '../../components/common/EmptyState';
import { CreateTicketModal } from '../tickets/CreateTicketModal';
import {
  Calendar,
  Clock,
  Ticket as TicketIcon,
  HeartHandshake,
  CheckCircle2,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Send,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { currentPath, repo, currentUser, navigate } = useApp();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [schedules, setSchedules] = useState<EventScheduleItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedScheduleEventId, setSelectedScheduleEventId] = useState<string>('');
  const [isRequestHelpOpen, setIsRequestHelpOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [allEvents, allSchedules, allTickets] = await Promise.all([
        repo.getEvents(),
        repo.getSchedules(),
        repo.getTickets(),
      ]);
      setEvents(allEvents);
      setSchedules(allSchedules);
      setTickets(allTickets);

      if (allEvents.length > 0 && !selectedScheduleEventId) {
        setSelectedScheduleEventId(allEvents[0].id);
      }
    } catch (err: unknown) {
      console.error('Error loading volunteer dashboard:', err);
    }
  }, [repo, selectedScheduleEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 1. OVERVIEW VIEW (`/volunteer`)
  if (currentPath === '/volunteer' || currentPath === '/volunteer/') {
    const assignedTickets = tickets.filter(
      (t) => t.assigned_to === currentUser?.id || t.status === 'open' || t.status === 'acknowledged'
    );
    const escalatedTickets = tickets.filter((t) => t.status === 'escalated');

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Hero banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-700 to-stone-900 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              <HeartHandshake className="w-3.5 h-3.5 text-teal-200" />
              <span>Volunteer Duty Operations</span>
            </div>
            <h1 className="font-serif-heading font-bold text-3xl sm:text-4xl leading-tight">
              Welcome, {currentUser?.full_name?.split(' ')[0] || 'Maya'} 👋
            </h1>
            <p className="text-sm text-teal-50/90 leading-relaxed">
              You're on volunteer duty for the <strong className="text-white">Gatik Xplorer Hackathon</strong>. Assist participants at table helpdesks, manage meal logistics, and triage support queries.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/volunteer/tickets')}
                className="px-5 py-2.5 bg-white text-stone-900 text-xs font-bold rounded-xl shadow-xs hover:bg-teal-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Triage Assigned Tickets ({assignedTickets.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsRequestHelpOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl border border-rose-400/30 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Request Help from Coordinator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Responsibilities & Duty Scope Card */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900">
                Active Role: Volunteer
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Demo
              </span>
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-stone-900">
              Technical Support Desk & Floor Operations
            </h3>
            <p className="text-xs text-stone-600">
              Responsible for helping participants with hardware setups, Wi-Fi credentials, table power routing, and lunch distribution.
            </p>
          </div>

          <div className="text-xs font-mono-tech text-stone-500 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 shrink-0">
            Assigned: Campus Innovation Arena
          </div>
        </div>

        {/* Operational metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {events.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Assigned Events</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {assignedTickets.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Open in Scope</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {escalatedTickets.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Escalated Tickets</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {tickets.filter((t) => t.status === 'resolved').length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Resolved Inquiries</div>
            </div>
          </div>
        </div>

        {/* Assigned Duty Checkpoints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
              Assigned Operational Checkpoints
            </h2>
            <button
              onClick={() => navigate('/volunteer/schedule')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Schedule &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900">
                  Duty Checkpoint A
                </span>
                <span className="text-xs font-mono-tech text-stone-500">09:00 AM – 11:00 AM</span>
              </div>
              <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                Lobby Welcome & Security Badge Distribution
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Scan attendee QR passes, issue GreenPulse NFC badges, and guide arriving participants to Hall A.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900">
                  Duty Checkpoint B
                </span>
                <span className="text-xs font-mono-tech text-stone-500">07:00 PM – 08:30 PM</span>
              </div>
              <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                Dinner Catering & Dietary Box Coordination
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Oversee dinner line at dining hall, ensure labeled dietary request boxes reach team 12 and vegan attendees.
              </p>
            </div>
          </div>
        </div>

        {/* Open Inquiries Queue Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
              High-Priority Support Inquiries
            </h2>
            <button
              onClick={() => navigate('/volunteer/tickets')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Support Hub &rarr;</span>
            </button>
          </div>

          <div className="space-y-3">
            {assignedTickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate('/volunteer/tickets')}
                className="p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-xs flex items-center justify-between gap-4 cursor-pointer transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                      {ticket.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="font-serif-heading font-bold text-sm text-stone-900">
                    {ticket.subject}
                  </h4>
                  <div className="text-xs text-stone-500">
                    Raised by {ticket.created_by_name} • {ticket.event_title}
                  </div>
                </div>

                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Assist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Help Modal */}
        <CreateTicketModal
          isOpen={isRequestHelpOpen}
          onClose={() => setIsRequestHelpOpen(false)}
          events={events}
          onTicketCreated={loadData}
        />
      </div>
    );
  }

  // 2. ASSIGNED EVENTS VIEW (`/volunteer/events`)
  if (currentPath === '/volunteer/events') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Assigned Campus Events
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Review event venues, capacity numbers, and on-site logistics for your active assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-3xl bg-white border border-emerald-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    {event.category}
                  </span>
                  <h3 className="font-serif-heading font-bold text-xl text-stone-900 mt-1">
                    {event.title}
                  </h3>
                  <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                  Assigned
                </span>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {event.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs font-mono-tech text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Capacity: {event.registered_count || 0} / {event.capacity} seats
                </span>
                <span>Status: {event.status}</span>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedScheduleEventId(event.id);
                    navigate('/volunteer/schedule');
                  }}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>View Timeline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. EVENT SCHEDULE VIEW (`/volunteer/schedule`)
  if (currentPath === '/volunteer/schedule') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Volunteer Duty & Event Timeline
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Check session checkpoints, speaker transitions, and shift milestones.
          </p>
        </div>

        <ScheduleTimeline
          events={events}
          schedules={schedules}
          selectedEventId={selectedScheduleEventId}
          onSelectEvent={setSelectedScheduleEventId}
          onRefresh={loadData}
          allowEdit={false}
        />
      </div>
    );
  }

  // 4. SUPPORT TICKETS VIEW (`/volunteer/tickets`)
  if (currentPath === '/volunteer/tickets') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <TicketList
          tickets={tickets}
          onRefresh={loadData}
          title="Volunteer Support Helpdesk"
          description="Claim tickets, add diagnostic comments, transition statuses, and help attendees on-site."
        />
      </div>
    );
  }

  // 5. PROFILE VIEW (`/volunteer/profile`)
  if (currentPath === '/volunteer/profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <ProfileView />
      </div>
    );
  }

  return null;
};
