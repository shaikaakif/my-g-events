import React, { useEffect, useState } from 'react';
import { EventItem, ChallengeContent } from '../../types';
import { useApp } from '../../lib/data/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  Trophy,
  ExternalLink,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  isRegistered?: boolean;
  onRegisterSuccess?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  isRegistered,
  onRegisterSuccess,
}) => {
  const { repo, currentUser, showToast, navigate } = useApp();
  const [challenge, setChallenge] = useState<ChallengeContent | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (event) {
      repo.getChallengeContent(event.id).then((c) => setChallenge(c));
    } else {
      setChallenge(null);
    }
  }, [event, repo]);

  if (!event) return null;

  const registeredCount = event.registered_count || 0;
  const isFull = registeredCount >= event.capacity;
  const isPastDeadline = new Date(event.registration_deadline) < new Date();

  const handleRegister = async () => {
    if (!currentUser) {
      showToast('Please select a user identity first.', 'warning');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await repo.registerForEvent(event.id, currentUser.id);
      if (res.success) {
        showToast(
          res.member?.registration_status === 'waitlisted'
            ? 'Event is at capacity. You have been placed on the waitlist.'
            : `Successfully registered for ${event.title}!`,
          'success'
        );
        if (onRegisterSuccess) onRegisterSuccess();
        onClose();
      } else {
        showToast(res.error || 'Failed to complete registration.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Registration error: ${msg}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      description={`${event.category} • Hosted at ${event.venue}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative h-56 rounded-2xl overflow-hidden bg-stone-100">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-emerald-800 shadow-sm">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
              {event.status}
            </span>
          </div>
          {isRegistered && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              Registered Attendee
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-stone-700">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-stone-900">Starts</div>
              <div className="text-[11px] text-stone-600">{formatDate(event.start_date)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-stone-900">Venue</div>
              <div className="text-[11px] text-stone-600">{event.venue}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-stone-900">Capacity</div>
              <div className="text-[11px] font-mono-tech text-stone-600">
                {registeredCount} / {event.capacity} seats filled
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-serif-heading font-bold text-base text-stone-900 mb-1.5">
            About the Event
          </h4>
          <p className="text-sm text-stone-600 leading-relaxed">{event.description}</p>
        </div>

        {/* Challenge / Hackathon Details if available */}
        {challenge && (
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2 font-serif-heading font-bold text-amber-950 text-base">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>{challenge.title}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">{challenge.problem_statement}</p>

            {challenge.objectives && challenge.objectives.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                  Key Deliverables
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700">
                  {challenge.objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {challenge.resources && challenge.resources.length > 0 && (
              <div className="pt-2 border-t border-amber-200/60">
                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2">
                  Official Resources & APIs
                </div>
                <div className="flex flex-wrap gap-2">
                  {challenge.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-100 rounded-lg border border-amber-200 text-xs font-semibold text-amber-900 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>{res.title}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Registration Deadline & Actions */}
        <div className="pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>
              Registration Deadline: <strong>{formatDate(event.registration_deadline)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                if (currentUser) {
                  navigate(`/${currentUser.role}/schedule`);
                }
              }}
              className="py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {!isRegistered ? (
              <button
                onClick={handleRegister}
                disabled={isRegistering || isPastDeadline}
                className={`flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                  isPastDeadline
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : isFull
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {isRegistering
                  ? 'Registering...'
                  : isPastDeadline
                  ? 'Registration Closed'
                  : isFull
                  ? 'Join Waitlist'
                  : 'Register for Event'}
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  navigate('/participant/registrations');
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>View Registration Pass</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
