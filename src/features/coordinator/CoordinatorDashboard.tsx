import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { EventItem, EventMember, EventScheduleItem, Ticket, ChallengeContent } from '../../types';
import { EventCard } from '../events/EventCard';
import { EventFormModal } from '../events/EventFormModal';
import { EventDetailModal } from '../events/EventDetailModal';
import { TicketList } from '../tickets/TicketList';
import { CreateTicketModal } from '../tickets/CreateTicketModal';
import { ScheduleTimeline } from '../schedule/ScheduleTimeline';
import { ProfileView } from '../profile/ProfileView';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Users,
  Clock,
  Ticket as TicketIcon,
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  MapPin,
  Save,
  Trash2,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  UserPlus,
  Package,
  AlertTriangle,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const { currentPath, repo, currentUser, showToast, navigate } = useApp();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventMember[]>([]);
  const [schedules, setSchedules] = useState<EventScheduleItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedScheduleEventId, setSelectedScheduleEventId] = useState<string>('');

  // Modals & form state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [ticketPreset, setTicketPreset] = useState<{ category: string; subject: string } | null>(null);

  const handleOpenPresetTicket = (category: string, subject: string) => {
    setTicketPreset({ category, subject });
    setIsCreateTicketOpen(true);
  };

  // Challenge editor state
  const [challengeEventId, setChallengeEventId] = useState<string>('');
  const [challengeTitle, setChallengeTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);

  // Registration search
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [regEventFilter, setRegEventFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [allEvents, allRegs, allSchedules, allTickets] = await Promise.all([
        repo.getEvents(),
        repo.getRegistrations(),
        repo.getSchedules(),
        repo.getTickets(),
      ]);
      setEvents(allEvents);
      setRegistrations(allRegs);
      setSchedules(allSchedules);
      setTickets(allTickets);

      const targetEvId = allEvents[0]?.id || '';
      if (!selectedScheduleEventId && targetEvId) {
        setSelectedScheduleEventId(targetEvId);
      }
      if (!challengeEventId && targetEvId) {
        setChallengeEventId(targetEvId);
      }
    } catch (err: unknown) {
      console.error('Error loading coordinator dashboard:', err);
    }
  }, [repo, selectedScheduleEventId, challengeEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load challenge content when challengeEventId changes
  useEffect(() => {
    if (challengeEventId) {
      repo.getChallengeContent(challengeEventId).then((c) => {
        if (c) {
          setChallengeTitle(c.title);
          setProblemStatement(c.problem_statement);
          setObjectives(c.objectives || []);
          setRules(c.rules || []);
        } else {
          setChallengeTitle('Campus Innovation Track Challenge');
          setProblemStatement('Define the problem statement and technical objectives for this competition.');
          setObjectives([
            'Build a fully working prototype with clear business impact',
            'Provide measurable telemetry or analytics',
          ]);
          setRules([
            'Teams of 2 to 4 members permitted',
            'All code must be demonstrated during presentation review',
          ]);
        }
      });
    }
  }, [challengeEventId, repo]);

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeEventId) return;

    setIsSavingChallenge(true);
    try {
      await repo.saveChallengeContent({
        event_id: challengeEventId,
        title: challengeTitle,
        problem_statement: problemStatement,
        objectives,
        rules,
        resources: [
          { title: 'Campus Open Data Catalog', url: 'https://opendata.campus.edu', type: 'dataset' },
          { title: 'API Documentation & Guidelines', url: 'https://docs.campus.edu', type: 'doc' },
        ],
      });
      showToast('Challenge brief and rules updated successfully.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error saving challenge: ${msg}`, 'error');
    } finally {
      setIsSavingChallenge(false);
    }
  };

  // 1. OVERVIEW VIEW (`/coordinator`)
  if (currentPath === '/coordinator' || currentPath === '/coordinator/') {
    const totalAttendees = registrations.filter((r) => r.registration_status === 'confirmed').length;
    const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Hero banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Activity Coordinator Command</span>
            </div>
            <h1 className="font-serif-heading font-bold text-3xl sm:text-4xl leading-tight">
              Welcome, {currentUser?.full_name}!
            </h1>
            <p className="text-sm text-emerald-50/90 leading-relaxed">
              Supervise hackathons and symposia, curate live session timelines, update problem statements, and resolve escalated participant inquiries.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setEventToEdit(null);
                  setIsEventModalOpen(true);
                }}
                className="px-5 py-2.5 bg-white text-stone-900 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campus Event</span>
              </button>
              <button
                onClick={() => navigate('/coordinator/challenge')}
                className="px-5 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-400/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Manage Challenge Briefs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Operational metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {events.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Managed Events</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {totalAttendees}
              </div>
              <div className="text-xs text-stone-500 font-medium">Confirmed Attendees</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {schedules.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Agenda Sessions</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {openTickets}
              </div>
              <div className="text-xs text-stone-500 font-medium">Open Support Tickets</div>
            </div>
          </div>
        </div>

        {/* My Events Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
                Managed Campus Events
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Review capacity fill rates, venues, and event publishing status.
              </p>
            </div>
            <button
              onClick={() => navigate('/coordinator/events')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Events &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={(ev) => setSelectedEventForDetail(ev)}
                isManageable={true}
                onEdit={(ev) => {
                  setEventToEdit(ev);
                  setIsEventModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Request from Principal / Administration */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <ShieldAlert className="w-3 h-3" />
                <span>Administration Support</span>
              </div>
              <h3 className="font-serif-heading font-bold text-xl text-white mt-1.5">
                Request Help from Principal & Administration
              </h3>
              <p className="text-xs text-stone-300">
                Direct requests sent to Dr. Eleanor Sterling (Event Administrator)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => handleOpenPresetTicket('Need Urgent Help', 'Request Additional Volunteers for Desk Coverage')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-200">
                Need Urgent Help
              </div>
              <div className="text-[11px] text-stone-300 mt-1 leading-snug">
                Request more student volunteers for helpdesks or mentor guides.
              </div>
            </button>

            <button
              onClick={() => handleOpenPresetTicket('Supplies & Materials', 'Hardware Kits & Materials Request')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-200">
                Supplies & Materials
              </div>
              <div className="text-[11px] text-stone-300 mt-1 leading-snug">
                Request badges, IoT dev kits, catering extensions, or cables.
              </div>
            </button>

            <button
              onClick={() => handleOpenPresetTicket('Venue & Access', 'Auditorium & Lab Access Extension')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-amber-200">
                Venue & Access
              </div>
              <div className="text-[11px] text-stone-300 mt-1 leading-snug">
                Request extended auditorium hours or room switches.
              </div>
            </button>
          </div>
        </div>

        {/* Support Tickets overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
              Recent Event Inquiries & Escalations
            </h2>
            <button
              onClick={() => navigate('/coordinator/tickets')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Tickets &rarr;</span>
            </button>
          </div>

          <div className="space-y-3">
            {tickets.slice(0, 3).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate('/coordinator/tickets')}
                className="p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-xs flex items-center justify-between gap-4 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                      {t.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="font-serif-heading font-bold text-sm text-stone-900 mt-1">
                    {t.subject}
                  </h4>
                  <div className="text-xs text-stone-500">
                    Raised by {t.created_by_name} • {t.event_title}
                  </div>
                </div>

                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        <EventFormModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setEventToEdit(null);
          }}
          eventToEdit={eventToEdit}
          onSaved={loadData}
        />

        <EventDetailModal
          event={selectedEventForDetail}
          isOpen={Boolean(selectedEventForDetail)}
          onClose={() => setSelectedEventForDetail(null)}
          onRegisterSuccess={loadData}
        />

        <CreateTicketModal
          isOpen={isCreateTicketOpen}
          onClose={() => {
            setIsCreateTicketOpen(false);
            setTicketPreset(null);
          }}
          events={events}
          defaultCategory={ticketPreset?.category}
          defaultSubject={ticketPreset?.subject}
          onTicketCreated={loadData}
        />
      </div>
    );
  }

  // 2. MY EVENTS VIEW (`/coordinator/events`)
  if (currentPath === '/coordinator/events') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
              Coordinator Event Management
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Add new events, adjust capacities, edit deadlines, and manage publishing states.
            </p>
          </div>

          <button
            onClick={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={(ev) => setSelectedEventForDetail(ev)}
              isManageable={true}
              onEdit={(ev) => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
            />
          ))}
        </div>

        <EventFormModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setEventToEdit(null);
          }}
          eventToEdit={eventToEdit}
          onSaved={loadData}
        />

        <EventDetailModal
          event={selectedEventForDetail}
          isOpen={Boolean(selectedEventForDetail)}
          onClose={() => setSelectedEventForDetail(null)}
          onRegisterSuccess={loadData}
        />
      </div>
    );
  }

  // 3. REGISTRATIONS VIEW (`/coordinator/registrations`)
  if (currentPath === '/coordinator/registrations') {
    const filteredRegistrations = registrations.filter((r) => {
      const evMatch = regEventFilter === 'all' || r.event_id === regEventFilter;
      const searchMatch =
        (r.participant?.full_name || '').toLowerCase().includes(regSearchQuery.toLowerCase()) ||
        (r.participant?.email || '').toLowerCase().includes(regSearchQuery.toLowerCase()) ||
        (r.event?.title || '').toLowerCase().includes(regSearchQuery.toLowerCase());
      return evMatch && searchMatch;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Attendee Registrations
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Review registered attendees, admission statuses, and capacity allocations across events.
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={regSearchQuery}
              onChange={(e) => setRegSearchQuery(e.target.value)}
              placeholder="Search by participant name, email, or event title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={regEventFilter}
            onChange={(e) => setRegEventFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 outline-none focus:border-emerald-500"
          >
            <option value="all">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Attendees Table */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Participant</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 font-mono-tech">Registration Date</th>
                  <th className="py-3.5 px-4 text-right">Pass ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400 italic">
                      No registrations match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              reg.participant?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-300 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900">
                              {reg.participant?.full_name || 'Campus Student'}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono-tech">
                              {reg.participant?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-800">
                        {reg.event?.title || 'Campus Event'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            reg.registration_status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.registration_status === 'waitlisted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {reg.registration_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-tech text-stone-600">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-tech text-stone-400">
                        #{reg.id.substring(0, 8)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 4. SCHEDULE MANAGEMENT VIEW (`/coordinator/schedule`)
  if (currentPath === '/coordinator/schedule') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Event Schedule & Agenda Editor
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Build, edit, and organize session sequences, start/end times, and room assignments.
          </p>
        </div>

        <ScheduleTimeline
          events={events}
          schedules={schedules}
          selectedEventId={selectedScheduleEventId}
          onSelectEvent={setSelectedScheduleEventId}
          onRefresh={loadData}
          allowEdit={true}
        />
      </div>
    );
  }

  // 5. CHALLENGE INFORMATION VIEW (`/coordinator/challenge`)
  if (currentPath === '/coordinator/challenge') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
              Competition & Challenge Brief
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Publish hackathon problem statements, deliverables, scoring rules, and documentation links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Event:</span>
            <select
              value={challengeEventId}
              onChange={(e) => setChallengeEventId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800 outline-none focus:border-emerald-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSaveChallenge} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Challenge Track Title *
              </label>
              <input
                type="text"
                required
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="e.g. GreenPulse Campus Net-Zero Challenge"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500 font-serif-heading font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Core Problem Statement *
              </label>
              <textarea
                required
                rows={4}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Detail the pain point, student focus areas, and required architecture..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Key Objectives & Deliverables
              </label>
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const copy = [...objectives];
                        copy[i] = e.target.value;
                        setObjectives(copy);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add an objective..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newObjective.trim()) {
                        setObjectives([...objectives, newObjective.trim()]);
                        setNewObjective('');
                      }
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded-xl text-stone-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Competition Rules & Eligibility
              </label>
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => {
                        const copy = [...rules];
                        copy[i] = e.target.value;
                        setRules(copy);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setRules(rules.filter((_, idx) => idx !== i))}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule or restriction..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRule.trim()) {
                        setRules([...rules, newRule.trim()]);
                        setNewRule('');
                      }
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded-xl text-stone-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingChallenge}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingChallenge ? 'Saving Brief...' : 'Publish Challenge Brief'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // 6. SUPPORT TICKETS VIEW (`/coordinator/tickets`)
  if (currentPath === '/coordinator/tickets') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-heading font-bold text-sm text-amber-950">
                Direct Principal Escalation
              </h4>
              <p className="text-xs text-amber-800">
                Need extra volunteers or urgent room/supply approvals? Submit an administrative request directly.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleOpenPresetTicket('Need Urgent Help', 'Request Additional Volunteers for Desk Coverage')}
              className="px-3 py-1.5 bg-white text-stone-800 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-100/60 transition-colors cursor-pointer"
            >
              + Extra Volunteers
            </button>
            <button
              onClick={() => handleOpenPresetTicket('Supplies & Materials', 'Hardware Kits & Materials Request')}
              className="px-3 py-1.5 bg-white text-stone-800 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-100/60 transition-colors cursor-pointer"
            >
              + Equipment Request
            </button>
          </div>
        </div>

        <TicketList
          tickets={tickets}
          onRefresh={loadData}
          onCreateTicket={() => {
            setTicketPreset(null);
            setIsCreateTicketOpen(true);
          }}
          title="Coordinator Support Tickets"
          description="Assign tickets to volunteers, review inquiries, and resolve campus requests."
        />

        <CreateTicketModal
          isOpen={isCreateTicketOpen}
          onClose={() => {
            setIsCreateTicketOpen(false);
            setTicketPreset(null);
          }}
          events={events}
          defaultCategory={ticketPreset?.category}
          defaultSubject={ticketPreset?.subject}
          onTicketCreated={loadData}
        />
      </div>
    );
  }

  // 7. PROFILE VIEW (`/coordinator/profile`)
  if (currentPath === '/coordinator/profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <ProfileView />
      </div>
    );
  }

  return null;
};
