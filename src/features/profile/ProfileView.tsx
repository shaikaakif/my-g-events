import React, { useState } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import {
  User,
  Mail,
  Shield,
  Sparkles,
  Save,
  CheckCircle2,
  HardDrive,
  Database,
  Calendar,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, repo, showToast, switchRole, dataMode } = useApp();

  const [name, setName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await repo.updateProfile(currentUser.id, {
        full_name: name.trim(),
        email: email.trim(),
        avatar_url: avatarUrl.trim(),
      });
      showToast('Profile updated successfully.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error updating profile: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'participant', title: 'Participant', desc: 'Aarav Patel (Student Attendee)' },
    { role: 'volunteer', title: 'Volunteer', desc: 'Maya Lin (Logistics & Duty Squad)' },
    { role: 'coordinator', title: 'Coordinator', desc: 'Prof. David Vance (Department Lead)' },
    { role: 'principal', title: 'Principal / Admin', desc: 'Dr. Eleanor Sterling (Executive Oversight)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border border-emerald-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-36 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
          <img
            src={avatarUrl || currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-emerald-300 shadow-md shrink-0"
          />

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-serif-heading font-bold text-xl sm:text-3xl text-stone-900 break-words">
                {currentUser.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                {currentUser.role}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-mono-tech flex items-center justify-center sm:justify-start gap-1.5 break-all">
              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{currentUser.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] sm:text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ID:</span>
                <code className="font-mono text-[10px] sm:text-[11px] text-stone-700 truncate max-w-[110px] sm:max-w-none">
                  {currentUser.id.substring(0, 13)}...
                </code>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {dataMode === 'supabase' ? (
                  <Database className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>Mode: <strong className="capitalize">{dataMode}</strong></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="font-serif-heading font-bold text-xl text-stone-900">
            Account Preferences
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Update personal contact details and presentation display information.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Campus Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono-tech text-stone-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Switch Demonstration Persona section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif-heading font-bold text-xl text-stone-900">
            Switch Demonstration Identity
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Quickly navigate across personas to present role-specific workflows to evaluators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((r) => {
            const isCurrent = currentUser.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-stone-50/50 hover:bg-emerald-50/40 border-stone-200'
                }`}
              >
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    {r.title}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{r.desc}</div>
                </div>
                {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
