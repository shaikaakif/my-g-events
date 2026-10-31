import React, { useState } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import { DataModeModal } from './DataModeModal';
import { PWAInstallButton } from './PWAInstallButton';
import { GEventsLogo } from './GEventsLogo';
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
  User,
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'participant', label: 'Participant', desc: 'Browse, register & raise tickets' },
    { role: 'volunteer', label: 'Volunteer', desc: 'Manage duties & assist support' },
    { role: 'coordinator', label: 'Coordinator', desc: 'Manage events, schedule & challenges' },
    { role: 'principal', label: 'Principal / Admin', desc: 'Full campus oversight & analytics' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden md:block lg:hidden p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group select-none min-w-0"
            >
              <GEventsLogo size="md" showText={true} />
              {dataMode === 'demo' ? (
                <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  Demo
                </span>
              ) : (
                <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300 shrink-0">
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Right side: Only Profile Picture Avatar */}
          <div className="flex items-center shrink-0">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="relative group p-0.5 rounded-2xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  title={`${currentUser.full_name} (${currentUser.role})`}
                  aria-label="User profile and options"
                >
                  <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-emerald-300/80 group-hover:ring-emerald-500 shadow-xs group-hover:shadow-md transition-all">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={currentUser.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  {/* Subtle active status indicator dot */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </button>

                {/* Unified Profile & Account Menu */}
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-80 bg-white/98 backdrop-blur-xl rounded-2xl border border-emerald-100/90 shadow-2xl p-2.5 z-40 space-y-2 animate-in fade-in zoom-in-95">
                      {/* User Persona Header */}
                      <div className="p-3 bg-gradient-to-br from-emerald-50/90 via-white to-stone-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <img
                          src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={currentUser.full_name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-300/80 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-stone-900 text-sm truncate">
                            {currentUser.full_name}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {currentUser.email}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Shield className="w-3 h-3" />
                            <span className="capitalize">{currentUser.role}</span>
                          </div>
                        </div>
                      </div>

                      {/* Switch Role Section */}
                      <div className="px-2 pt-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Switch Persona
                        </div>
                      </div>

                      <div className="space-y-1">
                        {roles.map((r) => {
                          const isActive = currentUser.role === r.role;
                          return (
                            <button
                              key={r.role}
                              onClick={() => {
                                switchRole(r.role);
                                setIsProfileMenuOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                                  : 'hover:bg-stone-50 text-stone-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isActive ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                                  }`}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <div className="font-bold truncate">{r.label}</div>
                                  <div className="text-[10px] text-stone-500 truncate leading-tight">
                                    {r.desc}
                                  </div>
                                </div>
                              </div>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* App Installation Option */}
                      <div className="pt-1.5 border-t border-stone-100">
                        <PWAInstallButton variant="header" />
                      </div>

                      {/* System Actions & Storage Info */}
                      <div className="pt-1 border-t border-stone-100 flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsDataModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {dataMode === 'supabase' ? (
                              <Database className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>Storage Architecture</span>
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              dataMode === 'supabase'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {dataMode === 'supabase' ? 'Supabase' : 'Demo Mode A'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Reset all demo events, tickets, gallery photos and registrations?')) {
                              resetDemoData();
                              setIsProfileMenuOpen(false);
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-emerald-700 hover:bg-emerald-50/60 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                          <span>Reset Demo Data</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            navigate(`/${currentUser.role}/profile`);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-stone-500" />
                          <span>View Profile Page</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Storage Architecture Modal */}
      <DataModeModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </>
  );
};
