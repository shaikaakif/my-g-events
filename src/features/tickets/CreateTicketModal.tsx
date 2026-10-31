import React, { useState } from 'react';
import { EventItem, TicketPriority } from '../../types';
import { useApp } from '../../lib/data/AppContext';
import { Modal } from '../../components/common/Modal';
import { Ticket, Send } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  defaultEventId?: string;
  defaultCategory?: string;
  defaultSubject?: string;
  onTicketCreated: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  events,
  defaultEventId,
  defaultCategory,
  defaultSubject,
  onTicketCreated,
}) => {
  const { repo, currentUser, showToast } = useApp();

  const [eventId, setEventId] = useState(defaultEventId || (events[0]?.id ?? ''));
  const [category, setCategory] = useState(defaultCategory || 'Technical');
  const [subject, setSubject] = useState(defaultSubject || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (defaultEventId) setEventId(defaultEventId);
      else if (events.length > 0 && !eventId) setEventId(events[0].id);
      if (defaultCategory) setCategory(defaultCategory);
      if (defaultSubject) setSubject(defaultSubject);
    }
  }, [isOpen, defaultEventId, defaultCategory, defaultSubject, events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('You must be logged in to create a ticket.', 'warning');
      return;
    }
    if (!subject.trim()) {
      showToast('Subject is required.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Description is required.', 'warning');
      return;
    }

    const targetEv = eventId || events[0]?.id;
    if (!targetEv) {
      showToast('Please select an event for this inquiry.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await repo.createTicket({
        event_id: targetEv,
        created_by: currentUser.id,
        assigned_to: null,
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        status: 'open',
        resolution_note: null,
      });

      showToast('Support ticket created successfully. Campus staff will respond soon.', 'success');
      setSubject('');
      setDescription('');
      onTicketCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to create ticket: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support Ticket"
      description="Submit a technical issue, schedule query, or venue accommodation request to the event team."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Related Event *
          </label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.category})
              </option>
            ))}
          </select>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-500"
            >
              <option value="Participant Help">Participant Help (Setup & Tools)</option>
              <option value="Volunteer Support">Volunteer Support</option>
              <option value="Additional Volunteers">Additional Volunteers Needed</option>
              <option value="Resources / Materials">Resources / Materials / Hardware</option>
              <option value="Venue / Schedule Issue">Venue / Schedule Issue</option>
              <option value="Technical">Technical (Wi-Fi, Cluster, Power)</option>
              <option value="Registration">Registration & Badge</option>
              <option value="Other">Other Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-500"
            >
              <option value="low">Low (General question)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="high">High (Urgent blocker)</option>
              <option value="urgent">Urgent (Immediate assistance)</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of the issue or inquiry"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Detailed Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please specify location (e.g., Table 4 in Hall A), symptoms, or dietary details..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Submit */}
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
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
