import React from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Clock,
  Compass,
  FileCheck2,
  Users,
  User,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser, currentPath, navigate } = useApp();

  if (!currentUser) return null;

  interface TabItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  const roleTabs: Record<UserRole, TabItem[]> = {
    participant: [
      { label: 'Overview', path: '/participant', icon: LayoutDashboard },
      { label: 'Explore', path: '/participant/events', icon: Compass },
      { label: 'Passes', path: '/participant/registrations', icon: FileCheck2 },
      { label: 'Schedule', path: '/participant/schedule', icon: Clock },
      { label: 'Tickets', path: '/participant/tickets', icon: Ticket },
    ],
    volunteer: [
      { label: 'Overview', path: '/volunteer', icon: LayoutDashboard },
      { label: 'Assigned', path: '/volunteer/events', icon: Calendar },
      { label: 'Schedule', path: '/volunteer/schedule', icon: Clock },
      { label: 'Tickets', path: '/volunteer/tickets', icon: Ticket },
      { label: 'Profile', path: '/volunteer/profile', icon: User },
    ],
    coordinator: [
      { label: 'Overview', path: '/coordinator', icon: LayoutDashboard },
      { label: 'Events', path: '/coordinator/events', icon: Calendar },
      { label: 'Attendees', path: '/coordinator/registrations', icon: Users },
      { label: 'Schedule', path: '/coordinator/schedule', icon: Clock },
      { label: 'Tickets', path: '/coordinator/tickets', icon: Ticket },
    ],
    principal: [
      { label: 'Overview', path: '/principal', icon: LayoutDashboard },
      { label: 'Events', path: '/principal/events', icon: Calendar },
      { label: 'Members', path: '/principal/members', icon: Users },
      { label: 'Schedule', path: '/principal/schedule', icon: Clock },
      { label: 'Tickets', path: '/principal/tickets', icon: Ticket },
    ],
  };

  const tabs = roleTabs[currentUser.role] || [];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-200/90 shadow-lg px-2 py-1 safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-emerald-600 stroke-[2.5]' : 'text-stone-400 stroke-2'
                }`}
              />
              <span className="text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
