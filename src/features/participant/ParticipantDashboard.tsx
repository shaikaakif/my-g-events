import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { EventItem, EventMember, EventScheduleItem, Ticket } from '../../types';
import { EventCard } from '../events/EventCard';
import { EventDetailModal } from '../events/EventDetailModal';
import { TicketList } from '../tickets/TicketList';
import { CreateTicketModal } from '../tickets/CreateTicketModal';
import { ScheduleTimeline } from '../schedule/ScheduleTimeline';
import { ProfileView } from '../profile/ProfileView';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Compass,
  FileCheck2,
  Clock,
  Ticket as TicketIcon,
  Sparkles,
  ArrowRight,
  QrCode,
  MapPin,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Search,
  Star,
  MessageSquare,
} from 'lucide-react';

export const ParticipantDashboard: React.FC = () => {
  const { currentPath, repo, currentUser, showToast, navigate } = useApp();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventMember[]>([]);
  const [schedules, setSchedules] = useState<EventScheduleItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<'overview' | 'challenge' | 'feedback'>('overview');
  const [selectedScheduleEventId, setSelectedScheduleEventId] = useState<string>('');
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketPass, setSelectedTicketPass] = useState<EventMember | null>(null);

  const handleOpenFeedback = (ev: EventItem) => {
    setSelectedEventForDetail(ev);
    setDetailModalInitialTab('feedback');
  };

  const handleOpenDetail = (ev: EventItem) => {
    setSelectedEventForDetail(ev);
    setDetailModalInitialTab('overview');
  };

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [allEvents, userRegs, allSchedules, userTickets] = await Promise.all([
        repo.getEvents(),
        repo.getRegistrations(currentUser.id),
        repo.getSchedules(),
        repo.getTickets({ createdBy: currentUser.id }),
      ]);
      setEvents(allEvents);
      setRegistrations(userRegs);
      setSchedules(allSchedules);
      setTickets(userTickets);

      if (allEvents.length > 0 && !selectedScheduleEventId) {
        setSelectedScheduleEventId(allEvents[0].id);
      }
    } catch (err: unknown) {
      console.error('Error loading participant dashboard data:', err);
    }
  }, [currentUser, repo, selectedScheduleEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelRegistration = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;
    try {
      await repo.cancelRegistration(memberId);
      showToast('Registration cancelled.', 'info');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Cancel error: ${msg}`, 'error');
    }
  };

  const registeredEventIds = new Set(
    registrations.filter((r) => r.registration_status !== 'cancelled').map((r) => r.event_id)
  );

  // 1. OVERVIEW VIEW (`/participant`)
  if (currentPath === '/participant' || currentPath === '/participant/') {
    const upcomingRegistered = registrations.filter(
      (r) => r.registration_status === 'confirmed' && r.event
    );

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Participant Portal • G-Events</span>
            </div>
            <h1 className="font-serif-heading font-bold text-3xl sm:text-4xl leading-tight">
              Welcome, {currentUser?.full_name?.split(' ')[0] || 'Aarav'} 👋
            </h1>
            <p className="text-sm text-emerald-50/90 leading-relaxed">
              You're participating in the <strong className="text-white">Gatik Xplorer Hackathon</strong>. Explore the live timeline, challenge statement, and your admission pass below.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/participant/schedule')}
                className="px-5 py-2.5 bg-white text-emerald-900 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Live Event Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCreateTicketOpen(true)}
                className="px-5 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-400/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <TicketIcon className="w-3.5 h-3.5" />
                <span>Raise Support Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Event Overview & Next Up Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Overview Card */}
          <div className="p-5 rounded-3xl bg-white border border-emerald-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Hackathon
                </span>
                <h3 className="font-serif-heading font-bold text-xl text-stone-900 mt-1">
                  Gatik Xplorer Hackathon
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Campus Innovation Arena & Tech Concourse
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" /> Active
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs flex items-center justify-between font-mono-tech">
              <span>Timeline: 31 Oct – 1 Nov (2 Days)</span>
              <span className="text-emerald-700 font-bold">In Progress</span>
            </div>
          </div>

          {/* Next Up Card */}
          <div
            onClick={() => navigate('/participant/schedule')}
            className="p-5 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50/70 border border-teal-200/90 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group hover:border-teal-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Next Up on Schedule
              </span>
              <span className="text-xs font-mono-tech text-teal-700 font-bold bg-teal-100/80 px-2 py-0.5 rounded-lg">
                Upcoming
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif-heading font-bold text-lg text-stone-900 group-hover:text-teal-900 transition-colors">
                Hacking Sprint 1 & Mentor Office Hours
              </h4>
              <p className="text-xs text-stone-600 line-clamp-1">
                10:30 AM – 01:00 PM • Innovation Arena Floors 1 & 2
              </p>
            </div>

            <div className="text-xs font-bold text-teal-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>View full 2-day timeline &rarr;</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/participant/schedule')}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-center space-y-1 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-stone-900">Schedule</div>
            <div className="text-[10px] text-stone-500">2-Day Agenda</div>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('challenge-brief-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-center space-y-1 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-stone-900">Challenge</div>
            <div className="text-[10px] text-stone-500">Problem Statement</div>
          </button>

          <button
            onClick={() => {
              const target = events.find((e) => e.title.includes('Gatik')) || events[0];
              if (target) handleOpenFeedback(target);
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border-2 border-amber-300 hover:border-amber-400 hover:shadow-md transition-all text-center space-y-1 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-900 mx-auto flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 fill-stone-900 text-stone-900" />
            </div>
            <div className="text-xs font-extrabold text-amber-950">Event Feedback</div>
            <div className="text-[10px] text-amber-800 font-bold">Rate & Review ★</div>
          </button>

          <button
            onClick={() => navigate('/participant/tickets')}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-center space-y-1 cursor-pointer relative"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center font-bold">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-stone-900">My Tickets</div>
            <div className="text-[10px] text-stone-500">{tickets.length} inquiries</div>
          </button>

          <button
            onClick={() => navigate('/participant/profile')}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-center space-y-1 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 mx-auto flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-stone-900">My Profile</div>
            <div className="text-[10px] text-stone-500">Badge & Identity</div>
          </button>
        </div>

        {/* Feedback & Review Callout Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-2 border-amber-300/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Star className="w-6 h-6 fill-stone-900" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
                Attendee Feedback & Ratings
              </div>
              <h3 className="font-serif-heading font-bold text-base sm:text-lg text-stone-900 mt-0.5">
                Have you attended the Gatik Xplorer Hackathon?
              </h3>
              <p className="text-xs text-stone-600">
                Rate mentors, Wi-Fi connectivity, venue checkpoints, and event schedule.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const target = events.find((e) => e.title.includes('Gatik')) || events[0];
              if (target) handleOpenFeedback(target);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Star className="w-4 h-4 fill-stone-950" />
            <span>Leave Rating & Feedback</span>
          </button>
        </div>

        {/* Structured Challenge Section with Copy Button */}
        <div id="challenge-brief-section" className="p-6 rounded-3xl bg-white border border-emerald-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Hackathon Track Brief
              </span>
              <h3 className="font-serif-heading font-bold text-xl text-stone-900 mt-1">
                Gatik Xplorer: Smart Campus & Climate Action Challenge
              </h3>
            </div>

            <button
              onClick={() => {
                const text = `Gatik Xplorer Challenge:\nDevelop resilient software solutions that measure, gamify, and actively reduce campus resource waste (electricity, lab equipment idle cycles, and cafeteria meal excess) while empowering peer collaboration through real-time notifications and telemetry.`;
                navigator.clipboard.writeText(text);
                showToast('Challenge statement copied to clipboard!', 'success');
              }}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Copy Challenge Statement</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Develop resilient software solutions that measure, gamify, and actively reduce campus resource waste (electricity, lab equipment idle cycles, and cafeteria meal excess) while empowering peer collaboration through real-time notifications and telemetry.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5">
              <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Key Objectives
              </div>
              <ul className="text-xs text-stone-600 space-y-1">
                <li>• Live responsive dashboard with simulated telemetry</li>
                <li>• Actionable carbon & energy reduction analytics</li>
                <li>• Peer engagement and incentive mechanics</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5">
              <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Submission Rules
              </div>
              <ul className="text-xs text-stone-600 space-y-1">
                <li>• Teams of 2 to 4 student participants</li>
                <li>• Live deployment URL & 2-minute pitch required</li>
                <li>• Code freeze: 1 Nov 2026, 02:00 PM</li>
              </ul>
            </div>
          </div>
        </div>

        {/* My Registered Events Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
                My Active Registrations
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Passes and admission status for your registered campus events.
              </p>
            </div>
            <button
              onClick={() => navigate('/participant/registrations')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({registrations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingRegistered.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Active Registrations"
              description="You have not registered for any events yet. Check out the campus catalog and claim your seat!"
              actionText="Explore Events Catalog"
              onAction={() => navigate('/participant/events')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingRegistered.slice(0, 2).map((reg) => (
                <div
                  key={reg.id}
                  className="p-5 rounded-3xl bg-white border border-emerald-200/90 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {reg.event?.category}
                      </span>
                      <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                        {reg.event?.title}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-2 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{reg.event?.venue}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedTicketPass(reg)}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Digital Admission Pass</span>
                    </button>
                    <button
                      onClick={() => {
                        if (reg.event) setSelectedEventForDetail(reg.event);
                      }}
                      className="text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Event Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Upcoming Events Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-heading font-bold text-2xl text-stone-900">
                Featured Campus Events
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Join competitions, keynotes, and student networking showcases.
              </p>
            </div>
            <button
              onClick={() => navigate('/participant/events')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>See Full Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => {
              const reg = registrations.find((r) => r.event_id === event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={Boolean(reg && reg.registration_status !== 'cancelled')}
                  registrationStatus={reg?.registration_status}
                  onSelect={(ev) => handleOpenDetail(ev)}
                  onOpenFeedback={(ev) => handleOpenFeedback(ev)}
                  onRegister={(ev) => handleOpenDetail(ev)}
                />
              );
            })}
          </div>
        </div>

        {/* Modals */}
        <EventDetailModal
          event={selectedEventForDetail}
          isOpen={Boolean(selectedEventForDetail)}
          initialTab={detailModalInitialTab}
          onClose={() => setSelectedEventForDetail(null)}
          isRegistered={Boolean(
            selectedEventForDetail && registeredEventIds.has(selectedEventForDetail.id)
          )}
          onRegisterSuccess={loadData}
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

  // 2. EXPLORE EVENTS VIEW (`/participant/events`)
  if (currentPath === '/participant/events') {
    const filteredEvents = events.filter((ev) => {
      const matchCat = categoryFilter === 'all' || ev.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Explore Campus Events
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse and register for hackathons, engineering symposia, workshops, and cultural galas.
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title, keyword, or venue location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100">
            {['all', 'Hackathon', 'Symposium', 'Workshop', 'Cultural'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer capitalize ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No Matching Events Found"
            description="Try adjusting your search criteria or selecting another category filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const reg = registrations.find((r) => r.event_id === event.id);
              const isReg = Boolean(reg && reg.registration_status !== 'cancelled');

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={isReg}
                  registrationStatus={reg?.registration_status}
                  onSelect={(ev) => handleOpenDetail(ev)}
                  onOpenFeedback={(ev) => handleOpenFeedback(ev)}
                  onRegister={(ev) => handleOpenDetail(ev)}
                />
              );
            })}
          </div>
        )}

        <EventDetailModal
          event={selectedEventForDetail}
          isOpen={Boolean(selectedEventForDetail)}
          initialTab={detailModalInitialTab}
          onClose={() => setSelectedEventForDetail(null)}
          isRegistered={Boolean(
            selectedEventForDetail && registeredEventIds.has(selectedEventForDetail.id)
          )}
          onRegisterSuccess={loadData}
        />
      </div>
    );
  }

  // 3. MY REGISTRATIONS VIEW (`/participant/registrations`)
  if (currentPath === '/participant/registrations') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            My Event Registrations
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Access your admission credentials, verified seating status, and digital passes.
          </p>
        </div>

        {registrations.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No Registrations Yet"
            description="You have not enrolled in any campus events. Explore our catalog to register!"
            actionText="Browse Available Events"
            onAction={() => navigate('/participant/events')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => {
              const ev = reg.event;
              if (!ev) return null;

              const isCancelled = reg.registration_status === 'cancelled';
              const isWaitlisted = reg.registration_status === 'waitlisted';

              return (
                <div
                  key={reg.id}
                  className={`p-6 rounded-3xl bg-white border transition-all space-y-4 ${
                    isCancelled
                      ? 'border-stone-200 opacity-60'
                      : 'border-emerald-200/90 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {ev.category}
                      </span>
                      <h3 className="font-serif-heading font-bold text-xl text-stone-900 mt-1">
                        {ev.title}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{ev.venue}</span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isCancelled
                          ? 'bg-stone-200 text-stone-600'
                          : isWaitlisted
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      {isCancelled ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </>
                      ) : isWaitlisted ? (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Waitlisted
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </>
                      )}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-600 flex justify-between items-center font-mono-tech">
                    <span>
                      Registered: {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                    <span>Pass ID: #{reg.id.substring(0, 8)}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <button
                          onClick={() => setSelectedTicketPass(reg)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-emerald-700" />
                          <span>Admission Pass</span>
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => handleOpenFeedback(ev)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Rate & Review</span>
                        </button>
                      )}
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelRegistration(reg.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <EventDetailModal
          event={selectedEventForDetail}
          isOpen={Boolean(selectedEventForDetail)}
          initialTab={detailModalInitialTab}
          onClose={() => setSelectedEventForDetail(null)}
          isRegistered={Boolean(
            selectedEventForDetail && registeredEventIds.has(selectedEventForDetail.id)
          )}
          onRegisterSuccess={loadData}
        />

        {/* Digital Admission Pass Modal */}
        {selectedTicketPass && selectedTicketPass.event && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-emerald-300 shadow-2xl p-6 sm:p-8 space-y-6 text-center overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <QrCode className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900">
                  Confirmed Admission Pass
                </span>
                <h3 className="font-serif-heading font-bold text-2xl text-stone-900 mt-2">
                  {selectedTicketPass.event.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  {selectedTicketPass.event.venue}
                </p>
              </div>

              {/* Simulated QR Code box */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-emerald-300 flex flex-col items-center justify-center space-y-2">
                <div className="w-36 h-36 bg-white border border-stone-300 rounded-xl p-2 flex items-center justify-center shadow-xs">
                  <div className="w-full h-full bg-stone-900 rounded-lg flex items-center justify-center text-white font-mono-tech text-[10px] p-2 text-center">
                    G-EVENTS PASS AUTHENTICATED
                  </div>
                </div>
                <div className="text-[11px] font-mono-tech text-stone-500">
                  Attendee: {currentUser?.full_name} • Pass #{selectedTicketPass.id.substring(0, 8)}
                </div>
              </div>

              <button
                onClick={() => setSelectedTicketPass(null)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. SCHEDULE VIEW (`/participant/schedule`)
  if (currentPath === '/participant/schedule') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="font-serif-heading font-bold text-3xl text-stone-900">
            Event Schedule & Timeline
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            View chronological sessions, workshops, keynote presentations, and meal breaks.
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

  // 5. SUPPORT TICKETS VIEW (`/participant/tickets`)
  if (currentPath === '/participant/tickets') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <TicketList
          tickets={tickets}
          onRefresh={loadData}
          onCreateTicket={() => setIsCreateTicketOpen(true)}
          title="My Support Tickets"
          description="Inquire about dietary needs, Wi-Fi connectivity, venue checkpoints, or technical rules."
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

  // 6. PROFILE VIEW (`/participant/profile`)
  if (currentPath === '/participant/profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <ProfileView />
      </div>
    );
  }

  return null;
};
