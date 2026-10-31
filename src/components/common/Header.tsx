import React, { useState } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import { DataModeModal } from './DataModeModal';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Calendar,
  Sparkles,
  Database,
  HardDrive,
  RefreshCw,
  LogOut,
  ChevronDown,
  UserCheck,
  Shield,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    dataMode,
    switchRole,
    resetDemoData,
    logout,
    navigate,
  } = useApp();

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'participant', label: 'Participant', desc: 'Browse, register & raise tickets' },
    { role: 'volunteer', label: 'Volunteer', desc: 'Manage duties & assist support' },
    { role: 'coordinator', label: 'Coordinator', desc: 'Manage events, schedule & challenges' },
    { role: 'principal', label: 'Principal / Admin', desc: 'Full campus oversight & analytics' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden md:block lg:hidden p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-heading font-bold text-lg sm:text-xl text-stone-900 tracking-tight flex items-center gap-1.5">
                  G-Events
                  {dataMode === 'demo' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
                      Demo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-teal-100 text-teal-900 border border-teal-300">
                      Live
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-stone-500 font-medium tracking-normal -mt-0.5 hidden sm:inline">
                  Campus Activities Platform
                </span>
              </div>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Storage Mode Pill */}
            <button
              onClick={() => setIsDataModalOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                dataMode === 'supabase'
                  ? 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Click to view storage architecture & toggle Supabase"
            >
              {dataMode === 'supabase' ? (
                <>
                  <Database className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden md:inline">Mode B:</span> Supabase Live
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Mode A:</span> Demo Mode
                </>
              )}
            </button>

            {/* Quick Demo Reset */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo events, tickets, and registrations to initial state?')) {
                  resetDemoData();
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 transition-colors cursor-pointer"
              title="Reset sample events, registrations and tickets"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            {/* Role Switcher Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-50/60 rounded-xl border border-emerald-200 text-stone-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="capitalize">{currentUser.role}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {isRoleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsRoleDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-emerald-100 shadow-xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-stone-100">
                        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                          Switch Demonstration Persona
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          Change current dashboard and permissions
                        </div>
                      </div>

                      {roles.map((r) => {
                        const isActive = currentUser.role === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              switchRole(r.role);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                                : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                isActive ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                {r.label}
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500 font-normal leading-tight mt-0.5">
                                {r.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profile Avatar & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-100">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-300"
                />
                <button
                  onClick={logout}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Sign out of demonstration identity"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Select Role</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Storage Mode & System Architecture Modal */}
      <DataModeModal isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} />
    </>
  );
};
