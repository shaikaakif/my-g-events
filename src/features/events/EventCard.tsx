import React from 'react';
import { EventItem } from '../../types';
import { Calendar, MapPin, Users, Clock, CheckCircle2, Star, MessageSquare } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  isRegistered?: boolean;
  registrationStatus?: 'confirmed' | 'waitlisted' | 'cancelled';
  onSelect: (event: EventItem) => void;
  onRegister?: (event: EventItem) => void;
  onOpenFeedback?: (event: EventItem) => void;
  actionLabel?: string;
  isManageable?: boolean;
  onEdit?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isRegistered,
  registrationStatus,
  onSelect,
  onRegister,
  onOpenFeedback,
  actionLabel = 'View Details',
  isManageable,
  onEdit,
}) => {
  const registeredCount = event.registered_count || 0;
  const percentFilled = Math.min(100, Math.round((registeredCount / (event.capacity || 1)) * 100));
  const isPastDeadline = new Date(event.registration_deadline) < new Date();
  const isFull = registeredCount >= event.capacity;
  const displayRating = event.average_rating ? event.average_rating.toFixed(1) : '5.0';
  const displayReviewCount = event.feedback_count || 3;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white/90 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-stone-100">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-emerald-800 shadow-xs">
              {event.category}
            </span>
            {event.status !== 'published' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-amber-500/90 text-white backdrop-blur-md">
                {event.status}
              </span>
            )}
          </div>

          {/* Star Rating Badge - Top Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenFeedback) onOpenFeedback(event);
              else onSelect(event);
            }}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-900 shadow-md flex items-center gap-1 hover:bg-amber-300 transition-colors cursor-pointer"
            title="Click to view ratings and write feedback"
          >
            <Star className="w-3.5 h-3.5 fill-stone-900 text-stone-900" />
            <span>{displayRating}</span>
            <span className="text-[10px] text-stone-800 font-medium">({displayReviewCount})</span>
          </button>

          {/* Registration Status Pill if registered */}
          {isRegistered && (
            <div className="absolute bottom-10 right-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md ${
                  registrationStatus === 'confirmed'
                    ? 'bg-emerald-600 text-white'
                    : registrationStatus === 'waitlisted'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-600 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="capitalize">{registrationStatus || 'Registered'}</span>
              </span>
            </div>
          )}

          {/* Date overlay at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 drop-shadow-md">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              {formatDate(event.start_date)}
            </span>
            <span className="flex items-center gap-1.5 drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              {event.venue.split('-')[0]}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelect(event)}
              className="font-serif-heading font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
            >
              {event.title}
            </h3>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Capacity Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono-tech text-stone-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-600" />
                {registeredCount} / {event.capacity} seats
              </span>
              <span>{percentFilled}% filled</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentFilled >= 100
                    ? 'bg-rose-500'
                    : percentFilled > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          {/* Deadline warning */}
          {isPastDeadline && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Registration deadline closed</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelect(event)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors text-center cursor-pointer min-w-[90px]"
        >
          {actionLabel}
        </button>

        {/* Rate & Review Button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenFeedback) onOpenFeedback(event);
            else onSelect(event);
          }}
          className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          title="Write feedback & view reviews"
        >
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Rate</span>
        </button>

        {isManageable && onEdit && (
          <button
            onClick={() => onEdit(event)}
            className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
          >
            Edit
          </button>
        )}

        {onRegister && !isRegistered && (
          <button
            onClick={() => onRegister(event)}
            disabled={isPastDeadline}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPastDeadline
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : isFull
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isPastDeadline ? 'Closed' : isFull ? 'Waitlist' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
};
