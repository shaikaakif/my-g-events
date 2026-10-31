import React, { useState } from 'react';
import { EventItem, EventScheduleItem } from '../../types';
import { useApp } from '../../lib/data/AppContext';
import { ScheduleFormModal } from './ScheduleFormModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Clock,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Coffee,
  Code,
  Sparkles,
} from 'lucide-react';

interface ScheduleTimelineProps {
  events: EventItem[];
  schedules: EventScheduleItem[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onRefresh: () => void;
  allowEdit?: boolean;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  events,
  schedules,
  selectedEventId,
  onSelectEvent,
  onRefresh,
  allowEdit = false,
}) => {
  const { repo, showToast } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<EventScheduleItem | null>(null);
  const [dayFilter, setDayFilter] = useState<'all' | 1 | 2>('all');

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  let eventSchedules = schedules
    .filter((s) => s.event_id === (currentEvent?.id ?? ''))
    .sort((a, b) => a.sequence_number - b.sequence_number);

  if (dayFilter !== 'all') {
    eventSchedules = eventSchedules.filter((s) => (s.day || 1) === dayFilter);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this session from the schedule?')) return;
    try {
      await repo.deleteScheduleItem(id);
      showToast('Session removed from schedule.', 'success');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error deleting session: ${msg}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
            Select Campus Event Timeline
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedEventId || currentEvent?.id || ''}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="font-serif-heading font-bold text-base sm:text-lg text-stone-900 bg-transparent outline-none cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allowEdit && currentEvent && (
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-Day Tabs for Hackathon */}
      <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDayFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              dayFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setDayFilter(1)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              dayFilter === 1
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Day 1 (31 Oct)
          </button>
          <button
            onClick={() => setDayFilter(2)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              dayFilter === 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Day 2 (1 Nov)
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-stone-500 font-medium pr-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Core Activity
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Meal / Break
          </span>
        </div>
      </div>

      {/* Timeline List */}
      {eventSchedules.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Sessions Scheduled Yet"
          description="The agenda for this event is currently being drafted by the event coordinators."
          actionText={allowEdit ? 'Add First Session' : undefined}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-200 ml-4 sm:ml-6 space-y-5 py-2">
          {eventSchedules.map((item, index) => {
            const isBreak = item.is_break || item.title.toLowerCase().includes('break') || item.title.toLowerCase().includes('lunch') || item.title.toLowerCase().includes('dinner') || item.title.toLowerCase().includes('breakfast');

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Pin Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 rounded-full bg-white border-2 font-mono-tech text-xs font-bold flex items-center justify-center shadow-xs transition-all ${
                    isBreak
                      ? 'border-amber-400 text-amber-700 group-hover:bg-amber-400 group-hover:text-white'
                      : 'border-emerald-500 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                  }`}
                >
                  {isBreak ? (
                    <Coffee className="w-3.5 h-3.5" />
                  ) : (
                    item.sequence_number || index + 1
                  )}
                </div>

                {/* Card Container */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all space-y-2 ${
                    isBreak
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : 'bg-white border-emerald-100/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono-tech font-bold ${
                          isBreak
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {item.start_time} – {item.end_time}
                      </span>

                      {item.day && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                          Day {item.day}
                        </span>
                      )}

                      {isBreak && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                          Break & Catering
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        {item.venue}
                      </span>
                    </div>

                    {allowEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setItemToEdit(item);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit session"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="font-serif-heading font-bold text-base sm:text-lg text-stone-900">
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {currentEvent && (
        <ScheduleFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setItemToEdit(null);
          }}
          eventId={currentEvent.id}
          itemToEdit={itemToEdit}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
};
