import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { EventItem, EventMember, EventScheduleItem, Ticket, Profile, UserRole } from '../../types';
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
  BarChart3,
  ShieldCheck,
  Plus,
  Archive,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  UserCheck,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { currentPath, repo, currentUser, showToast, navigate } = useApp();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventMember[]>([]);
  const [schedules, setSchedules] = useState<EventScheduleItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedScheduleEventId, setSelectedScheduleEventId] = useState<string>('');

  // Modals & form state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

  // Search/filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [allEvents, allRegs, allSchedules, allTickets, allProfs] = await Promise.all([
        repo.getEvents(),
        repo.getRegistrations(),
        repo.getSchedules(),
        repo.getTickets(),
        repo.getProfiles(),
      ]);
      setEvents(allEvents);
      setRegistrations(allRegs);
      setSchedules(allSchedules);
      setTickets(allTickets);
      setProfiles(allProfs);

      if (allEvents.length > 0 && !selectedScheduleEventId) {
        setSelectedScheduleEventId(allEvents[0].id);
      }
    } catch (err: unknown) {
      console.error('Error loading principal dashboard:', err);
    }
  }, [repo, selectedScheduleEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open modal if URL is `/principal/events/new`
  useEffect(() => {
    if (currentPath === '/principal/events/new') {
      setEventToEdit(null);
      setIsEventModalOpen(true);
    }
  }, [currentPath]);

  const handleToggleArchive = async (event: EventItem) => {
    const nextStatus = event.status === 'archived' ? 'published' : 'archived';
    try {
      await repo.updateEvent(event.id, { status: nextStatus });
      showToast(`Event status updated to ${nextStatus}.`, 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to update status: ${msg}`, 'error');
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: UserRole) => {
    try {
      await repo.updateProfile(userId, { role: newRole });
      showToast(`Role updated to ${newRole.toUpperCase()}.`, 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to update member role: ${msg}`, 'error');
    }
  };

  const totalCapacity = events.reduce((acc, ev) => acc + (ev.capacity || 0), 0);
  const totalConfirmed = registrations.filter((r) => r.registration_status === 'confirmed').length;
  const pendingTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  // 1. OVERVIEW VIEW (`/principal`)
  if (currentPath === '/principal' || currentPath === '/principal/') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Principal Leadership Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Campus Executive Administration</span>
            </div>
            <h1 className="font-serif-heading font-bold text-3xl sm:text-4xl leading-tight">
              Executive Dashboard, {currentUser?.full_name}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              Institutional oversight across campus hackathons, symposium accreditations, budget capacities, staff rosters, and incident response SLAs.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setEventToEdit(null);
                  setIsEventModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campus Event</span>
              </button>
              <button
                onClick={() => navigate('/principal/reports')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Executive Reports & KPIs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executive Metrics 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {events.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Campus Events Registry</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {totalConfirmed}
              </div>
              <div className="text-xs text-stone-500 font-medium">Confirmed Registrations</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {pendingTickets}
              </div>
              <div className="text-xs text-stone-500 font-medium">Active Support Tickets</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif-heading font-bold text-2xl text-stone-900">
                {profiles.length}
              </div>
              <div className="text-xs text-stone-500 font-medium">Active Campus Users</div>
            </div>
          </div>
        </div>

        {/* Campus Events Registry Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
                Active Campus Events
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Full institutional control over capacity, scheduling, and archiving.
              </p>
            </div>
            <button
              onClick={() => navigate('/principal/events')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Events &rarr;</span>
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

        {/* Institutional Health & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                Capacity Allocation Utilization
              </h3>
              <span className="text-xs font-mono-tech text-emerald-700 font-bold">
                {Math.round((totalConfirmed / (totalCapacity || 1)) * 100)}% Overall Fill
              </span>
            </div>

            <div className="space-y-3">
              {events.slice(0, 4).map((ev) => {
                const filled = ev.registered_count || 0;
                const pct = Math.min(100, Math.round((filled / (ev.capacity || 1)) * 100));
                return (
                  <div key={ev.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-800 truncate">{ev.title}</span>
                      <span className="font-mono-tech text-stone-500">
                        {filled} / {ev.capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                Staff Roster Overview
              </h3>
              <button
                onClick={() => navigate('/principal/members')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Manage Members &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {profiles.slice(0, 4).map((prof) => (
                <div
                  key={prof.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-300 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-stone-900">{prof.full_name}</div>
                      <div className="text-[11px] text-stone-500 font-mono-tech">{prof.email}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-stone-200 text-stone-700">
                    {prof.role}
                  </span>
                </div>
              ))}
            </div>
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
      </div>
    );
  }

  // 2. EVENTS REGISTRY VIEW (`/principal/events` and `/principal/events/new`)
  if (currentPath === '/principal/events' || currentPath === '/principal/events/new') {
    const filteredEvents = events.filter((ev) => {
      if (eventStatusFilter === 'all') return true;
      return ev.status === eventStatusFilter;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
              Campus Events Registry
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Create, review, publish, and archive university-sanctioned events.
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

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'published', 'draft', 'completed', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setEventStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer capitalize ${
                eventStatusFilter === st
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {st === 'all' ? 'All Events' : st}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative">
              <EventCard
                event={event}
                onSelect={(ev) => setSelectedEventForDetail(ev)}
                isManageable={true}
                onEdit={(ev) => {
                  setEventToEdit(ev);
                  setIsEventModalOpen(true);
                }}
              />
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => handleToggleArchive(event)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 hover:bg-white text-stone-700 shadow-sm border border-stone-200 transition-colors cursor-pointer"
                  title="Toggle event archive status"
                >
                  {event.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            </div>
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

  // 3. MEMBERS VIEW (`/principal/members`)
  if (currentPath === '/principal/members') {
    const filteredProfiles = profiles.filter((p) => {
      const matchRole = memberRoleFilter === 'all' || p.role === memberRoleFilter;
      const matchSearch =
        p.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(memberSearch.toLowerCase());
      return matchRole && matchSearch;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Campus Members & Role Allocation
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage faculty coordinators, student participants, volunteer dispatch, and institutional roles.
          </p>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search member by full name or email address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={memberRoleFilter}
            onChange={(e) => setMemberRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 outline-none focus:border-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="participant">Participant</option>
            <option value="volunteer">Volunteer</option>
            <option value="coordinator">Coordinator</option>
            <option value="principal">Principal</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Name & Contact</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4 font-mono-tech">User UUID</th>
                  <th className="py-3.5 px-6 text-right">Assign Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-300 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{p.full_name}</div>
                          <div className="text-[11px] text-stone-500 font-mono-tech">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tech text-stone-500 text-[11px]">
                      {p.id.substring(0, 13)}...
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <select
                        value={p.role}
                        onChange={(e) => handleUpdateMemberRole(p.id, e.target.value as UserRole)}
                        className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="participant">Participant</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="principal">Principal</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 4. REGISTRATIONS VIEW (`/principal/registrations`)
  if (currentPath === '/principal/registrations') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Campus Registration Master Audit
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Complete cross-departmental registration logs, confirmed passes, and waitlist allocations.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Participant</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 font-mono-tech">Date</th>
                  <th className="py-3.5 px-6 text-right">Pass ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-stone-900">
                        {reg.participant?.full_name || 'Student Attendee'}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono-tech">
                        {reg.participant?.email}
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
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {reg.registration_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tech text-stone-600">
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono-tech text-stone-400">
                      #{reg.id.substring(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 5. MASTER SCHEDULE VIEW (`/principal/schedule`)
  if (currentPath === '/principal/schedule') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Master Campus Schedule
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Institutional overview and timeline management across all academic and cultural venues.
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

  // 6. SUPPORT TICKETS VIEW (`/principal/tickets`)
  if (currentPath === '/principal/tickets') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <TicketList
          tickets={tickets}
          onRefresh={loadData}
          onCreateTicket={() => setIsCreateTicketOpen(true)}
          title="Campus Incident & Support Center"
          description="Administrative oversight over inquiries, staff assignments, and resolutions."
        />

        <CreateTicketModal
          isOpen={isCreateTicketOpen}
          onClose={() => setIsCreateTicketOpen(false)}
          events={events}
          onTicketCreated={loadData}
        />
      </div>
    );
  }

  // 7. REPORTS VIEW (`/principal/reports`)
  if (currentPath === '/principal/reports') {
    const eventsByCategory = events.reduce((acc, ev) => {
      acc[ev.category] = (acc[ev.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByStatus = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Executive Analytics & Reports
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Aggregated institutional metrics on student engagement, venue utilization, and support turnaround.
          </p>
        </div>

        {/* 3 Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Category Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
            <h3 className="font-serif-heading font-bold text-lg text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Events by Category</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(eventsByCategory).map(([cat, count]) => {
                const pct = Math.round((count / (events.length || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-stone-700">{cat}</span>
                      <span className="font-mono-tech text-stone-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Capacity Utilization */}
          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
            <h3 className="font-serif-heading font-bold text-lg text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <span>Capacity Performance</span>
            </h3>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-center space-y-1">
              <div className="font-serif-heading font-bold text-3xl text-teal-950">
                {totalConfirmed} / {totalCapacity}
              </div>
              <div className="text-xs text-teal-700 font-medium">
                Total Campus Seats Allocated
              </div>
            </div>

            <div className="text-xs text-stone-600 space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>Average Seats per Event:</span>
                <span className="font-mono-tech font-bold text-stone-900">
                  {Math.round(totalCapacity / (events.length || 1))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Waitlisted Demand:</span>
                <span className="font-mono-tech font-bold text-amber-700">
                  {registrations.filter((r) => r.registration_status === 'waitlisted').length}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Support SLA Summary */}
          <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
            <h3 className="font-serif-heading font-bold text-lg text-stone-900 flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-amber-600" />
              <span>Support SLA Health</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(ticketsByStatus).map(([st, count]) => {
                const pct = Math.round((count / (tickets.length || 1)) * 100);
                return (
                  <div key={st} className="space-y-1">
                    <div className="flex justify-between text-xs capitalize">
                      <span className="font-medium text-stone-700">{st.replace('_', ' ')}</span>
                      <span className="font-mono-tech text-stone-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          st === 'resolved' ? 'bg-emerald-500' : st === 'open' ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 8. PROFILE VIEW (`/principal/profile`)
  if (currentPath === '/principal/profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <ProfileView />
      </div>
    );
  }

  return null;
};
