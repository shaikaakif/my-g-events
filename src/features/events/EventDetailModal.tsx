import React, { useEffect, useState } from 'react';
import { EventItem, ChallengeContent, EventFeedback } from '../../types';
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
  Star,
  MessageSquare,
  Send,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  isRegistered?: boolean;
  onRegisterSuccess?: () => void;
  initialTab?: 'overview' | 'challenge' | 'feedback';
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  isRegistered,
  onRegisterSuccess,
  initialTab = 'overview',
}) => {
  const { repo, currentUser, showToast, navigate } = useApp();
  const [challenge, setChallenge] = useState<ChallengeContent | null>(null);
  const [feedbacks, setFeedbacks] = useState<EventFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenge' | 'feedback'>(initialTab);
  const [isRegistering, setIsRegistering] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (event) {
      repo.getChallengeContent(event.id).then((c) => setChallenge(c));
      repo.getEventFeedbacks(event.id).then((f) => setFeedbacks(f));
    } else {
      setChallenge(null);
      setFeedbacks([]);
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in or select a demo identity to leave feedback.', 'warning');
      return;
    }
    if (!feedbackComment.trim()) {
      showToast('Please enter your feedback comments.', 'warning');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const newFb = await repo.addEventFeedback({
        event_id: event.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.role,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      });
      setFeedbacks((prev) => [newFb, ...prev]);
      showToast('Thank you! Your rating and feedback have been published.', 'success');
      setFeedbackComment('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

  const quickPillTags = [
    '⚡ Super Fast Wi-Fi',
    '🎓 Excellent Mentors',
    '🕒 On-Time Schedule',
    '🍱 Great Meals & Refreshments',
    '💻 Innovative Problem Statement',
    '🤝 Great Team Collaboration',
  ];

  const handleAddTagToComment = (tag: string) => {
    setFeedbackComment((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag + ' — ';
      if (trimmed.includes(tag)) return trimmed;
      return `${trimmed}. ${tag}`;
    });
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '5/5 — Outstanding & Highly Recommended';
      case 4:
        return '4/5 — Very Good & Well Organized';
      case 3:
        return '3/5 — Good / Met Expectations';
      case 2:
        return '2/5 — Needs Noticeable Improvement';
      case 1:
        return '1/5 — Poor Experience';
      default:
        return `${score}/5`;
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
      <div className="space-y-5">
        {/* Cover Image & Badges */}
        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-stone-100">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-emerald-800 shadow-xs">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
              {event.status}
            </span>
          </div>

          {/* Average Rating Badge on Cover */}
          <button
            onClick={() => setActiveTab('feedback')}
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/95 text-stone-900 shadow-md backdrop-blur-md flex items-center gap-1.5 cursor-pointer hover:bg-amber-300 transition-colors"
          >
            <Star className="w-4 h-4 fill-stone-900 text-stone-900" />
            <span>{avgRating} / 5.0</span>
            <span className="text-[11px] text-stone-800 font-medium">
              ({feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''})
            </span>
          </button>

          {isRegistered && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              Registered Attendee
            </div>
          )}
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            📋 Overview & Details
          </button>

          {challenge && (
            <button
              type="button"
              onClick={() => setActiveTab('challenge')}
              className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === 'challenge'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              🏆 Challenge Track
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'feedback'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-stone-600 hover:text-amber-800 hover:bg-amber-50/30'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Ratings & Feedback</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
              {feedbacks.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Quick Rating Teaser Banner */}
            <div
              onClick={() => setActiveTab('feedback')}
              className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-stone-900" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>Attendee Rating: {avgRating} / 5.0</span>
                    <span className="text-[11px] font-normal text-stone-600">
                      ({feedbacks.length} verified reviews)
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Click here to write your feedback & rate this event
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <span>Rate & Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
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
          </div>
        )}

        {/* TAB 2: CHALLENGE */}
        {activeTab === 'challenge' && challenge && (
          <div className="space-y-4 animate-in fade-in duration-200">
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
          </div>
        )}

        {/* TAB 3: RATINGS & FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Score Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-20 h-20 rounded-2xl bg-amber-400 text-stone-900 flex flex-col items-center justify-center shadow-md">
                  <span className="font-serif-heading font-extrabold text-3xl leading-none">{avgRating}</span>
                  <div className="flex text-stone-900 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-stone-900" />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-serif-heading font-bold text-lg text-stone-900">
                    Overall Event Rating
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Based on {feedbacks.length} verified participant and volunteer evaluation{feedbacks.length !== 1 ? 's' : ''}.
                  </p>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 mt-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>100% Verified Campus Attendees</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Feedback Form (Always visible & inviting) */}
            <form
              onSubmit={handleFeedbackSubmit}
              className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-emerald-300 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="font-serif-heading font-bold text-base text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Rate Your Experience & Leave Feedback</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Logged in as <strong>{currentUser?.full_name || 'Campus Attendee'}</strong> ({currentUser?.role})
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {feedbackRating} / 5 Stars
                </span>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Select Your Star Rating:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating !== null ? hoverRating : feedbackRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setFeedbackRating(star)}
                          className="p-1.5 hover:scale-125 transition-transform cursor-pointer"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-7 h-7 ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-stone-800">
                    {getRatingLabel(hoverRating !== null ? hoverRating : feedbackRating)}
                  </span>
                </div>
              </div>

              {/* Quick feedback tag chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Quick Feedback Tags (Click to include):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickPillTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTagToComment(tag)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 transition-colors border border-stone-200 cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Review & Suggestions:
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share details on venue facilities, mentorship quality, technical workshops, food, or schedule timing..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-stone-50/50"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingFeedback ? 'Publishing...' : 'Submit Rating & Feedback'}</span>
                </button>
              </div>
            </form>

            {/* List of Previous Feedback */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif-heading font-bold text-base text-stone-900">
                  Attendee Reviews ({feedbacks.length})
                </h4>
                <span className="text-xs text-stone-500">Sorted by most recent</span>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
                  No feedback reviews submitted yet. Use the form above to be the first!
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            {fb.user_name ? fb.user_name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs sm:text-sm">
                              {fb.user_name}
                            </div>
                            {fb.user_role && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold bg-stone-100 text-stone-600">
                                {fb.user_role}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= fb.rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-900 ml-1">
                            {fb.rating}.0
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-10">
                        {fb.comment}
                      </p>

                      <div className="text-[10px] font-mono-tech text-stone-400 pl-10">
                        Submitted on {new Date(fb.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Bottom Registration Actions */}
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
