import React, { useState } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { UserRole } from '../../types';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import { GEventsLogo } from '../../components/common/GEventsLogo';
import { getSupabaseClient } from '../../lib/supabase/client';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Database,
  GraduationCap,
  HeartHandshake,
  Trophy,
  Sparkles,
  Building2,
  Calendar,
  Users,
  Compass,
  BookOpen,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { switchRole, dataMode, isSupabaseAvailable, showToast } = useApp();

  // Screen view: 'institution' (G Group introductory screen) or 'auth' (G-Events sign in)
  const [screenView, setScreenView] = useState<'institution' | 'auth'>('institution');

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
      title: 'Demo Coordinator',
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

    const trimmed = email.trim().toLowerCase();
    const match = demoAccounts.find((d) => d.email.toLowerCase() === trimmed);
    if (match) {
      showToast(`Signed in as ${match.name}`, 'success');
      await switchRole(match.role);
    } else {
      showToast('Signing in with demonstration session.', 'info');
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

  // 1. INTRODUCTORY SCREEN: G Group of Institutions (Inspired by reference design)
  if (screenView === 'institution') {
    return (
      <div className="min-h-screen bg-[#F9FAF8] text-[#141A16] flex flex-col justify-between relative overflow-hidden selection:bg-emerald-200">
        {/* Dreamy Moving Aurora Gradient Background (Pistachio Green, Mint, Sky Blue & Blush Pink) */}
        <div className="fixed -top-[12%] -left-[10%] w-[750px] sm:w-[900px] h-[750px] sm:h-[900px] bg-gradient-to-br from-[#a7f3d0]/80 via-[#bbf7d0]/75 to-[#dcfce7]/40 rounded-full blur-[130px] pointer-events-none -z-10 animate-aurora-mesh-pistachio" />
        <div className="fixed -top-[8%] -right-[12%] w-[750px] sm:w-[900px] h-[750px] sm:h-[900px] bg-gradient-to-bl from-[#fbcfe8]/80 via-[#fce7f3]/75 to-[#ffe4e6]/50 rounded-full blur-[140px] pointer-events-none -z-10 animate-aurora-mesh-pink" />
        <div className="fixed top-[20%] left-[25%] w-[650px] h-[650px] bg-gradient-to-tr from-[#bae6fd]/55 via-[#cffafe]/65 to-[#a7f3d0]/45 rounded-full blur-[140px] pointer-events-none -z-10 animate-aurora-mesh-cyan" />
        <div className="fixed -bottom-[15%] left-[10%] w-[750px] h-[600px] bg-gradient-to-tr from-[#bbf7d0]/65 via-[#fbcfe8]/45 to-[#e0f2fe]/55 rounded-full blur-[150px] pointer-events-none -z-10 animate-aurora-mesh-pistachio" />

        {/* Top Institutional Header */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 border border-emerald-400/30 shrink-0">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-serif-heading font-extrabold text-base sm:text-lg text-stone-900 tracking-tight block leading-tight">
                G Group of Institutions
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                Autonomous University Campus System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Storage Mode Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-xs font-semibold text-stone-700">
              {dataMode === 'supabase' ? (
                <>
                  <Database className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-teal-900">Supabase Connected</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-900">Demo Active</span>
                </>
              )}
            </div>

            <button
              onClick={() => setScreenView('auth')}
              className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 px-4 py-2 rounded-xl bg-white/75 hover:bg-white/95 backdrop-blur-md border border-white/80 shadow-xs transition-all cursor-pointer"
            >
              Sign In &rarr;
            </button>
          </div>
        </header>

        {/* Hero Section Inspired by Reference Design */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 z-10 flex flex-col justify-center animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Pill Tag, Editorial Serif Heading, Subtitle & Primary CTA */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/60 border border-emerald-300/70 text-emerald-800 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>G GROUP OF INSTITUTIONS</span>
              </div>

              {/* Large Editorial Serif Heading */}
              <div className="space-y-3">
                <h1 className="font-serif-heading font-normal text-5xl sm:text-6xl xl:text-7xl text-stone-900 tracking-tight leading-[1.06]">
                  See Beyond <br className="hidden sm:inline" />
                  the <span className="italic font-serif text-emerald-600 font-normal">Event.</span>
                </h1>
                <p className="text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed pt-1">
                  Schedules tell you what is planned.
                  <br className="hidden sm:inline" />
                  <strong className="font-semibold text-stone-800">G-Events</strong> connects the entire campus to organize, compete, participate, and lead.
                </p>
              </div>

              {/* Action Buttons: Continue with G-Events & PWA Installation */}
              <div className="space-y-4 pt-1 max-w-md">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setScreenView('auth')}
                    className="flex-1 py-4 px-7 rounded-2xl bg-stone-900 hover:bg-emerald-900 text-white font-bold text-base shadow-xl shadow-stone-900/10 hover:shadow-emerald-900/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
                  >
                    <span>Continue with G-Events</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>

                {/* App Installation Option (Requirement 7: placed below Continue button) */}
                <PWAInstallButton variant="welcome" />

                {/* Featured Badge */}
                <div className="flex items-center gap-2 text-xs text-stone-600 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-3.5 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Featured Live: <strong className="text-stone-800">Gatik Xplorer Hackathon 2026</strong> (Arena & Concourse)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Frosted Portal Cards */}
            <div className="lg:col-span-6 space-y-4">
              {/* Card 1: Student Portal (Featured Card matching reference image) */}
              <div
                onClick={async () => {
                  showToast('Entering as Demo Participant', 'success');
                  await switchRole('participant');
                }}
                className="bg-white/75 hover:bg-white/90 backdrop-blur-xl border border-white/80 hover:border-emerald-300/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-stone-900/5 hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 border border-emerald-300/70 flex items-center justify-center text-emerald-700 shadow-xs">
                    <BookOpen className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100/70 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <h2 className="font-serif-heading font-bold text-2xl text-stone-900 mt-5 group-hover:text-emerald-950 transition-colors">
                  Student Portal
                </h2>
                <p className="text-sm text-emerald-800/85 mt-1.5 leading-relaxed font-normal">
                  Explore hackathons, register teams & track live submissions.
                </p>
              </div>

              {/* Bottom Row: Two Companion Cards Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 2: Volunteer Desk */}
                <div
                  onClick={async () => {
                    showToast('Entering Volunteer Desk', 'success');
                    await switchRole('volunteer');
                  }}
                  className="bg-white/75 hover:bg-white/90 backdrop-blur-xl border border-white/80 hover:border-teal-300/80 rounded-3xl p-5 sm:p-6 shadow-lg shadow-stone-900/5 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-teal-100/90 border border-teal-300/70 flex items-center justify-center text-teal-700 shadow-xs">
                    <HeartHandshake className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <h3 className="font-serif-heading font-bold text-lg text-stone-900 mt-4 group-hover:text-teal-950 transition-colors">
                    Volunteer Desk
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Checkpoints, queue assistance & live desk support.
                  </p>
                </div>

                {/* Card 3: Administration */}
                <div
                  onClick={async () => {
                    showToast('Entering Principal & Admin Office', 'success');
                    await switchRole('principal');
                  }}
                  className="bg-white/75 hover:bg-white/90 backdrop-blur-xl border border-white/80 hover:border-stone-400/80 rounded-3xl p-5 sm:p-6 shadow-lg shadow-stone-900/5 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-300/70 flex items-center justify-center text-stone-800 shadow-xs">
                    <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <h3 className="font-serif-heading font-bold text-lg text-stone-900 mt-4 group-hover:text-stone-950 transition-colors">
                    Administration
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Executive campus analytics, logs & event controls.
                  </p>
                </div>
              </div>

              {/* Coordinator Link Bar */}
              <div
                onClick={async () => {
                  showToast('Entering Coordinator Operations', 'success');
                  await switchRole('coordinator');
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/65 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-xs hover:border-cyan-300/80 transition-all text-xs font-semibold text-stone-700 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-cyan-600" />
                  <span>Activity Coordinator Hub • Tracks, Schedule & Live Scoring</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-cyan-700 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-stone-400 z-10 border-t border-stone-200/40">
          G Group of Institutions • Campus Activities & Innovation Division
        </footer>
      </div>
    );
  }

  // 2. AUTHENTICATION & DEMO LOGIN SCREEN
  return (
    <div className="min-h-screen bg-[#F9FAF8] text-[#141A16] flex flex-col justify-between relative overflow-x-hidden animate-in fade-in duration-300 selection:bg-emerald-200">
      {/* Moving Aurora Ambient Background: Pistachio Green & White */}
      <div className="fixed -top-[12%] -left-[10%] w-[750px] sm:w-[900px] h-[750px] sm:h-[900px] bg-gradient-to-br from-[#a7f3d0]/75 via-[#bbf7d0]/65 to-white/40 rounded-full blur-[130px] pointer-events-none -z-10 animate-aurora-mesh-pistachio" />
      <div className="fixed -top-[8%] -right-[12%] w-[750px] sm:w-[900px] h-[750px] sm:h-[900px] bg-gradient-to-bl from-[#dcfce7]/70 via-white/75 to-[#bbf7d0]/50 rounded-full blur-[140px] pointer-events-none -z-10 animate-aurora-mesh-pink" />
      <div className="fixed top-[25%] left-[20%] w-[650px] h-[650px] bg-gradient-to-tr from-white/80 via-[#cffafe]/40 to-[#a7f3d0]/45 rounded-full blur-[140px] pointer-events-none -z-10 animate-aurora-mesh-cyan" />
      <div className="fixed -bottom-[15%] left-[10%] w-[750px] h-[600px] bg-gradient-to-tr from-[#bbf7d0]/65 via-white/70 to-[#dcfce7]/55 rounded-full blur-[150px] pointer-events-none -z-10 animate-aurora-mesh-pistachio" />

      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreenView('institution')}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 py-1 px-2.5 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Return to G Group of Institutions Welcome Screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">G Group Portal</span>
          </button>

          <GEventsLogo size="md" subtitle="Campus Activities Platform" />
        </div>

        <div className="flex items-center gap-2">
          {/* Header Compact PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Mode Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-emerald-200 shadow-xs text-xs font-semibold text-stone-700">
            {dataMode === 'supabase' ? (
              <>
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-900 hidden sm:inline">Supabase Live</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-900 hidden sm:inline">Local Demo</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered Sign-In Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-md w-full mx-auto">
        {/* Brand Hero */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gatik Xplorer Hackathon • Active</span>
          </div>

          <h1 className="font-serif-heading font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Sign In to G-Events
          </h1>
          <p className="text-xs text-stone-600">
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
        <div className="w-full bg-white/95 rounded-3xl border border-emerald-200/90 shadow-xl p-5 sm:p-7 space-y-4">
          <form onSubmit={handleSignIn} className="space-y-3.5">
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
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Header */}
          <div className="pt-2 border-t border-stone-100 text-center">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Or explore with demo credentials
            </span>
          </div>

          {/* 4 Demo Roles Grid */}
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => switchRole(acc.role)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-stone-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-700">
                        {acc.title}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">{acc.name}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs text-stone-400">
        G-Events Platform • G Group of Institutions
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-emerald-200 space-y-4">
            <h3 className="font-serif-heading text-lg font-bold text-stone-900">
              Reset Campus Password
            </h3>
            <p className="text-xs text-stone-600">
              Enter your registered campus email address to receive password instructions.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@gatik.events"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Send Recovery Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
