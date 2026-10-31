import React, { useState, useEffect } from 'react';
import { EventItem, EventStatus } from '../../types';
import { useApp } from '../../lib/data/AppContext';
import { Modal } from '../../components/common/Modal';
import { Sparkles } from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem | null;
  onSaved: () => void;
}

const PRESET_IMAGES = [
  { label: 'Innovation Lab', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80' },
  { label: 'Auditorium Symposium', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cultural Fest Stage', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80' },
  { label: 'CS Workshop', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { label: 'Campus Concourse', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80' },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSaved,
}) => {
  const { repo, currentUser, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hackathon');
  const [venue, setVenue] = useState('Campus Innovation Hub');
  const [startDate, setStartDate] = useState('2026-11-20T09:00');
  const [endDate, setEndDate] = useState('2026-11-21T18:00');
  const [deadline, setDeadline] = useState('2026-11-18T23:59');
  const [capacity, setCapacity] = useState(100);
  const [status, setStatus] = useState<EventStatus>('published');
  const [coverImage, setCoverImage] = useState(PRESET_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setCategory(eventToEdit.category);
      setVenue(eventToEdit.venue);
      setStartDate(eventToEdit.start_date.substring(0, 16));
      setEndDate(eventToEdit.end_date.substring(0, 16));
      setDeadline(eventToEdit.registration_deadline.substring(0, 16));
      setCapacity(eventToEdit.capacity);
      setStatus(eventToEdit.status);
      setCoverImage(eventToEdit.cover_image);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Hackathon');
      setVenue('Campus Innovation Hub - Hall B');
      setStartDate('2026-11-20T09:00');
      setEndDate('2026-11-21T18:00');
      setDeadline('2026-11-18T23:59');
      setCapacity(100);
      setStatus('published');
      setCoverImage(PRESET_IMAGES[0].url);
    }
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Event title is required.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Event description is required.', 'warning');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('End date must be after start date.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (eventToEdit) {
        await repo.updateEvent(eventToEdit.id, {
          title,
          description,
          category,
          venue,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          registration_deadline: new Date(deadline).toISOString(),
          capacity: Number(capacity),
          status,
          cover_image: coverImage,
        });
        showToast('Event updated successfully.', 'success');
      } else {
        await repo.createEvent({
          title,
          description,
          category,
          venue,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          registration_deadline: new Date(deadline).toISOString(),
          capacity: Number(capacity),
          status,
          cover_image: coverImage,
          created_by: currentUser?.id || 'a3333333-3333-3333-3333-333333333333',
        });
        showToast('New event created and registered successfully.', 'success');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to save event: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Edit Campus Event' : 'Create New Campus Event'}
      description="Define event parameters, dates, capacity rules, and publishing status."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. NextGen Web3 & AI Hackathon"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-stone-900 outline-none transition-all"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 bg-white text-xs sm:text-sm text-stone-800 outline-none"
            >
              <option value="Hackathon">Hackathon</option>
              <option value="Symposium">Symposium</option>
              <option value="Workshop">Workshop</option>
              <option value="Cultural">Cultural</option>
              <option value="Conference">Conference</option>
              <option value="Sports">Sports</option>
              <option value="Orientation">Orientation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Publishing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 bg-white text-xs sm:text-sm text-stone-800 outline-none"
            >
              <option value="published">Published (Live for Attendees)</option>
              <option value="draft">Draft (Staff Only)</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Venue & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Venue / Location *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Science Concourse & Hall A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 text-xs sm:text-sm text-stone-900 outline-none"
            >
            </input>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Capacity (Seats)
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 font-mono-tech text-xs sm:text-sm text-stone-900 outline-none"
            />
          </div>
        </div>

        {/* Start, End Date & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 text-xs font-mono-tech text-stone-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 text-xs font-mono-tech text-stone-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 text-xs font-mono-tech text-stone-800 outline-none"
            />
          </div>
        </div>

        {/* Cover Image Preset Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Cover Image
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_IMAGES.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setCoverImage(preset.url)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  coverImage === preset.url
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Or enter image URL"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono-tech text-stone-700 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Detailed Overview & Rules *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scope, objectives, requirements, and benefits for students..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 text-xs sm:text-sm text-stone-900 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : eventToEdit ? 'Save Changes' : 'Publish Event'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
