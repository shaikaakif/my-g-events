import React from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Clock,
  User,
  Users,
  Compass,
  FileCheck2,
  Trophy,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentPath, navigate } = useApp();

  if (!currentUser) return null;

  const roleNavItems: Record<UserRole, NavItem[]> = {
    participant: [
      { label: 'Overview', path: '/participant', icon: LayoutDashboard },
      { label: 'Explore Events', path: '/participant/events', icon: Compass },
      { label: 'Campus Gallery', path: '/participant/gallery', icon: ImageIcon },
      { label: 'My Registrations', path: '/participant/registrations', icon: FileCheck2 },
      { label: 'Event Schedule', path: '/participant/schedule', icon: Clock },
      { label: 'Support Tickets', path: '/participant/tickets', icon: Ticket },
      { label: 'My Profile', path: '/participant/profile', icon: User },
    ],
    volunteer: [
      { label: 'Overview', path: '/volunteer', icon: LayoutDashboard },
      { label: 'Assigned Events', path: '/volunteer/events', icon: Calendar },
      { label: 'Campus Gallery', path: '/volunteer/gallery', icon: ImageIcon },
      { label: 'Event Schedule', path: '/volunteer/schedule', icon: Clock },
      { label: 'Support Tickets', path: '/volunteer/tickets', icon: Ticket },
      { label: 'My Profile', path: '/volunteer/profile', icon: User },
    ],
    coordinator: [
      { label: 'Overview', path: '/coordinator', icon: LayoutDashboard },
      { label: 'My Events', path: '/coordinator/events', icon: Calendar },
      { label: 'Campus Gallery', path: '/coordinator/gallery', icon: ImageIcon },
      { label: 'Registrations', path: '/coordinator/registrations', icon: Users },
      { label: 'Schedule Management', path: '/coordinator/schedule', icon: Clock },
      { label: 'Challenge Brief', path: '/coordinator/challenge', icon: Trophy },
      { label: 'Support Tickets', path: '/coordinator/tickets', icon: Ticket },
      { label: 'Coordinator Profile', path: '/coordinator/profile', icon: User },
    ],
    principal: [
      { label: 'Overview', path: '/principal', icon: LayoutDashboard },
      { label: 'Events Registry', path: '/principal/events', icon: Calendar },
      { label: 'Campus Gallery', path: '/principal/gallery', icon: ImageIcon },
      { label: 'Campus Members', path: '/principal/members', icon: Users },
      { label: 'Registrations', path: '/principal/registrations', icon: FileCheck2 },
      { label: 'Master Schedule', path: '/principal/schedule', icon: Clock },
      { label: 'Support Tickets', path: '/principal/tickets', icon: Ticket },
      { label: 'Analytics Reports', path: '/principal/reports', icon: BarChart3 },
      { label: 'Principal Profile', path: '/principal/profile', icon: User },
    ],
  };

  const navItems = roleNavItems[currentUser.role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-18 z-30 h-[calc(100vh-4.5rem)] w-68 bg-white/70 backdrop-blur-md border-r border-emerald-100 flex flex-col justify-between p-4 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Active Role Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/80">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.full_name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-400 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="font-serif-heading font-bold text-stone-900 text-sm truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 capitalize flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-stone-400 uppercase">
              Dashboard Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-stone-700 hover:text-emerald-900 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-stone-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-500 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role-Based Access</span>
          </div>
          <p className="leading-tight text-[10px]">
            Navigation, tickets, and event operations strictly enforced by role permissions.
          </p>
        </div>
      </aside>
    </>
  );
};
