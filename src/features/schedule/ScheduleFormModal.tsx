import React, { useState, useEffect } from 'react';
import { EventScheduleItem } from '../../types';
import { useApp } from '../../lib/data/AppContext';
import { Modal } from '../../components/common/Modal';
import { Clock, Plus } from 'lucide-react';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  itemToEdit?: EventScheduleItem | null;
  onSaved: () => void;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  eventId,
  itemToEdit,
  onSaved,
}) => {
  const { repo, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [venue, setVenue] = useState('Main Stage');
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description);
      setStartTime(itemToEdit.start_time);
      setEndTime(itemToEdit.end_time);
      setVenue(itemToEdit.venue);
      setSequenceNumber(itemToEdit.sequence_number);
    } else {
      setTitle('');
      setDescription('');
      setStartTime('10:00 AM');
      setEndTime('11:00 AM');
      setVenue('Innovation Hub');
      setSequenceNumber(1);
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        await repo.updateScheduleItem(itemToEdit.id, {
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          venue,
          sequence_number: Number(sequenceNumber),
        });
        showToast('Schedule session updated.', 'success');
      } else {
        await repo.createScheduleItem({
          event_id: eventId,
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          venue,
          sequence_number: Number(sequenceNumber),
        });
        showToast('Schedule session added.', 'success');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error saving session: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Schedule Session' : 'Add Event Schedule Session'}
      description="Define timing, venue checkpoint, and instructions for attendees."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Session Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Keynote Address or Lunch & Networking"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Start Time *
            </label>
            <input
              type="text"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 09:30 AM"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono-tech text-stone-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              End Time *
            </label>
            <input
              type="text"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 11:00 AM"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono-tech text-stone-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Venue / Room *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Room 304 / Main Stage"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Seq #
            </label>
            <input
              type="number"
              min="1"
              value={sequenceNumber}
              onChange={(e) => setSequenceNumber(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono-tech text-xs text-stone-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Brief Overview / Requirements
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, speaker names, materials to bring..."
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 outline-none focus:border-emerald-500"
          />
        </div>

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
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : itemToEdit ? 'Save Changes' : 'Add Session'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
