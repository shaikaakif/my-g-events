import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, TicketUpdate, TicketStatus, Profile } from '../../types';
import { useApp } from '../../lib/data/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  User,
  Shield,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  History,
  Send,
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onTicketUpdated,
}) => {
  const { repo, currentUser, showToast } = useApp();

  const [updates, setUpdates] = useState<TicketUpdate[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>('open');
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [updateNote, setUpdateNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTicketData = useCallback(async () => {
    if (!ticket) return;
    try {
      const [hist, profs] = await Promise.all([
        repo.getTicketUpdates(ticket.id),
        repo.getProfiles(),
      ]);
      setUpdates(hist);
      setProfiles(profs);
      setNewStatus(ticket.status);
      setNewAssignee(ticket.assigned_to || '');
    } catch (err) {
      console.error('Error loading ticket updates:', err);
    }
  }, [ticket, repo]);

  useEffect(() => {
    if (isOpen && ticket) {
      loadTicketData();
    }
  }, [isOpen, ticket, loadTicketData]);

  if (!ticket) return null;

  const isStaff = currentUser && ['volunteer', 'coordinator', 'principal'].includes(currentUser.role);
  const isVolunteer = currentUser?.role === 'volunteer';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!updateNote.trim()) {
      showToast('Please provide an update note or comment.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatesPayload: Partial<Ticket> = {
        status: newStatus,
        assigned_to: newAssignee ? newAssignee : ticket.assigned_to,
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updatesPayload.resolution_note = updateNote;
      }

      await repo.updateTicket(ticket.id, updatesPayload, currentUser.id, updateNote);

      showToast('Ticket updated successfully.', 'success');
      setUpdateNote('');
      await loadTicketData();
      onTicketUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Update error: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'resolved':
        return 'bg-emerald-600 text-white';
      case 'in_progress':
        return 'bg-teal-600 text-white';
      case 'acknowledged':
        return 'bg-cyan-600 text-white';
      case 'escalated':
        return 'bg-rose-600 text-white animate-pulse';
      case 'closed':
        return 'bg-stone-600 text-white';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket.subject}
      description={`Ticket #${ticket.id.substring(0, 8)} • ${ticket.category}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header Metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] ${getStatusBadge(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-[11px] uppercase ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
            <span className="text-stone-500 font-mono-tech">
              Event: <strong className="text-stone-800">{ticket.event_title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Creator: <strong className="text-stone-800">{ticket.created_by_name}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Assigned: <strong className="text-stone-800">{ticket.assigned_to_name}</strong>
            </span>
          </div>
        </div>

        {/* Issue Description */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Problem Description
          </div>
          <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Resolution note if present */}
        {ticket.resolution_note && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Official Resolution Note
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">{ticket.resolution_note}</p>
          </div>
        )}

        {/* History / Audit updates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Activity Log & Staff Notes ({updates.length})</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {updates.length === 0 ? (
              <div className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-xl">
                No progress updates logged yet.
              </div>
            ) : (
              updates.map((up) => (
                <div
                  key={up.id}
                  className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      {up.updated_by_name}
                    </span>
                    <span className="font-mono-tech">
                      {new Date(up.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{up.note}</p>
                  {up.old_status !== 'none' && up.old_status !== up.new_status && (
                    <div className="text-[10px] text-stone-500 pt-0.5">
                      Status moved: <span className="font-medium text-stone-700">{up.old_status}</span> &rarr;{' '}
                      <span className="font-semibold text-emerald-700">{up.new_status}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Panel for Updates */}
        <form onSubmit={handleUpdate} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Post Update or Transition Status</span>
          </div>

          {isStaff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Status Transition
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="open">Open</option>
                  <option value="acknowledged">Acknowledged (Claimed)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="escalated">Escalated (To Coordinator / Principal)</option>
                  <option value="resolved">Resolved (Provide resolution note)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {!isVolunteer && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Assignee
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 outline-none focus:border-emerald-500"
                  >
                    <option value="">Unassigned</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <textarea
              required
              rows={2}
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              placeholder={
                isStaff
                  ? 'Add resolution details, diagnostics note, or volunteer dispatch note...'
                  : 'Add a reply or follow-up note...'
              }
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
