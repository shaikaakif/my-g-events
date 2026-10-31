import React, { useState } from 'react';
import { Ticket } from '../../types';
import { TicketDetailModal } from './TicketDetailModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onRefresh: () => void;
  onCreateTicket?: () => void;
  title?: string;
  description?: string;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onRefresh,
  onCreateTicket,
  title = 'Support & Inquiries',
  description = 'Track live participant questions, catering needs, and technical alerts.',
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.event_title && t.event_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'in_progress':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'acknowledged':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'escalated':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'closed':
        return 'bg-stone-200 text-stone-700 border-stone-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-heading font-bold text-2xl text-stone-900">{title}</h2>
          <p className="text-xs text-stone-600 mt-1">{description}</p>
        </div>

        {onCreateTicket && (
          <button
            onClick={onCreateTicket}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, description, or event name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Registration">Registration</option>
              <option value="Schedule">Schedule</option>
              <option value="Venue">Venue</option>
              <option value="Logistics">Logistics</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-stone-100">
          {['all', 'open', 'acknowledged', 'in_progress', 'escalated', 'resolved', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No Support Tickets Found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try clearing search filters to see all campus support tickets.'
              : 'There are currently no open support requests in this queue.'
          }
          actionText={onCreateTicket ? 'Create First Ticket' : undefined}
          onAction={onCreateTicket}
        />
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="group p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                    {ticket.category}
                  </span>
                </div>

                <h3 className="font-serif-heading font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors truncate">
                  {ticket.subject}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-1 leading-relaxed">
                  {ticket.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500 pt-1 font-mono-tech">
                  <span className="truncate">
                    Event: <strong className="text-stone-700">{ticket.event_title}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" />
                    {ticket.created_by_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-stone-400" />
                    {ticket.assigned_to_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                <span className="text-[11px] font-mono-tech text-stone-400">
                  {new Date(ticket.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="w-8 h-8 rounded-xl bg-stone-50 group-hover:bg-emerald-50 group-hover:text-emerald-700 text-stone-400 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onTicketUpdated={() => {
          onRefresh();
          // Update selected ticket in place if needed
        }}
      />
    </div>
  );
};
