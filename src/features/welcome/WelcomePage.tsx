import React, { useState } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import { getSupabaseClient } from '../../lib/supabase/client';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Database,
  GraduationCap,
  HeartHandshake,
  Trophy,
  Sparkles,
  Download,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { switchRole, dataMode, isSupabaseAvailable, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const demoAccounts: {
    role: UserRole;
    name: string;
    email: string;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      role: 'participant',
      name: 'Aarav Patel',
      email: 'demo.participant@gatik.events',
      title: 'Demo Participant',
      desc: 'Student participant & competitor',
      icon: GraduationCap,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      role: 'volunteer',
      name: 'Maya Lin',
      email: 'demo.volunteer@gatik.events',
      title: 'Demo Volunteer',
      desc: 'Tech support desk & on-site assistance',
      icon: HeartHandshake,
      color: 'bg-teal-100 text-teal-800 border-teal-300',
    },
    {
      role: 'coordinator',
      name: 'Prof. David Vance',
      email: 'demo.coordinator@gatik.events',
      title: 'Demo Activity Coordinator',
      desc: 'Event operations & schedule manager',
      icon: Trophy,
      color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    },
    {
      role: 'principal',
      name: 'Dr. Eleanor Sterling',
      email: 'demo.principal@gatik.events',
      title: 'Demo Principal',
      desc: 'Campus event administrator',
      icon: ShieldCheck,
      color: 'bg-stone-200 text-stone-900 border-stone-300',
    },
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter an email address.', 'warning');
      return;
    }

    setIsLoading(true);

    // If Supabase is configured, attempt real auth
    if (dataMode === 'supabase' && isSupabaseAvailable) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });
          if (error) {
            showToast(`Authentication failed: ${error.message}`, 'error');
            setIsLoading(false);
            return;
          }
          if (data.user) {
            showToast('Authenticated successfully with Supabase!', 'success');
            // Fetch profile and navigate
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            if (prof?.role) {
              await switchRole(prof.role);
            } else {
              await switchRole('participant');
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Auth error';
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }
    }

    // In demo mode or if checking demo email
    const trimmed = email.trim().toLowerCase();
    const match = demoAccounts.find((d) => d.email.toLowerCase() === trimmed);
    if (match) {
      showToast(`Signed in with demo credentials as ${match.name}`, 'success');
      await switchRole(match.role);
    } else {
      // Allow demo sign-in with default participant or prompt
      showToast('Signing in with demonstration session. Use Quick Demo Access for specific roles.', 'info');
      await switchRole('participant');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Password recovery link sent to ${forgotEmail || 'your email'}. Check inbox.`, 'info');
    setShowForgotModal(false);
    setForgotEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#141A16] flex flex-col justify-between relative overflow-x-hidden">
      {/* Aurora Ambient Background Accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D1FAE5]/50 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[400px] h-[400px] bg-[#C4B5FD]/30 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-serif-heading font-extrabold text-xl text-stone-900 tracking-tight">
              G-Events
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              PWA Ready
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Mode Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-emerald-200 shadow-xs text-xs font-semibold text-stone-700">
            {dataMode === 'supabase' ? (
              <>
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-900">Supabase Live</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-900">Local Demo</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered Sign-In Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md w-full mx-auto">
        {/* Brand Hero */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gatik Xplorer Hackathon • Active</span>
          </div>

          <h1 className="font-serif-heading font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
            G-Events Sign In
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Your campus activities, all in one place.
          </p>
        </div>

        {/* Participant Registration Shortcut */}
        <button
          onClick={() => switchRole('participant')}
          className="w-full mb-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Continue as Demo Participant</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Centered Sign-In Box */}
        <div className="w-full bg-white/95 rounded-3xl border border-emerald-200/90 shadow-xl p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gatik.events"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Section (Clearly Separated) */}
          <div className="pt-4 border-t border-emerald-100 space-y-3">
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Quick Demo Access (4 Presentation Roles)
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Explore the platform instantly with synthetic demo identities:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => switchRole(acc.role)}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-400 bg-stone-50/70 hover:bg-emerald-50/60 transition-all text-left flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 truncate">
                        {acc.title}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono-tech truncate">
                        {acc.email}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Notice Bottom */}
        <div className="mt-6 text-center text-xs text-stone-500 space-y-1">
          <p>
            Current Featured Event: <strong className="text-stone-800">Gatik Xplorer Hackathon</strong>
          </p>
          <p className="text-[11px]">31 October – 1 November • 2-Day Schedule</p>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-emerald-200 space-y-4">
            <h3 className="font-serif-heading font-bold text-lg text-stone-900">
              Reset Password
            </h3>
            <p className="text-xs text-stone-600">
              Enter your registered campus email to receive a secure password recovery link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@gatik.events"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 border-t border-emerald-100/70 text-center text-xs text-stone-400">
        G-Events Campus Activity Platform • Progressive Web App
      </footer>
    </div>
  );
};
