import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Profile, UserRole, DataMode, AppNotification } from '../../types';
import { IEventRepository } from '../repositories/types';
import { LocalDemoRepository } from '../repositories/localDemoRepository';
import { SupabaseRepository } from '../repositories/supabaseRepository';
import { isSupabaseConfigured } from '../supabase/client';

interface AppContextValue {
  currentUser: Profile | null;
  dataMode: DataMode;
  isSupabaseAvailable: boolean;
  repo: IEventRepository;
  notifications: AppNotification[];
  currentPath: string;
  navigate: (to: string) => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchUser: (profile: Profile) => void;
  logout: () => void;
  switchDataMode: (mode: DataMode) => void;
  resetDemoData: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const localRepoInstance = new LocalDemoRepository();
let supabaseRepoInstance: SupabaseRepository | null = null;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabaseAvail = isSupabaseConfigured();
  
  // Data mode state
  const [dataMode, setDataMode] = useState<DataMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gevents_data_mode');
      if (saved === 'supabase' && isSupabaseAvail) return 'supabase';
    }
    return 'demo';
  });

  // Current active repository
  const repo = useMemo<IEventRepository>(() => {
    if (dataMode === 'supabase' && isSupabaseAvail) {
      if (!supabaseRepoInstance) {
        supabaseRepoInstance = new SupabaseRepository();
      }
      return supabaseRepoInstance;
    }
    return localRepoInstance;
  }, [dataMode, isSupabaseAvail]);

  // Current user
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Simple router state synced with window.location
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newNote: AppNotification = { id, message, type, timestamp: Date.now() };
    setNotifications((prev) => [...prev, newNote]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Load profiles on mount or repository switch
  const loadProfiles = useCallback(async () => {
    try {
      const profiles = await repo.getProfiles();
      setAllProfiles(profiles);

      // Check saved user session
      const savedUserId = localStorage.getItem('gevents_current_user_id');
      if (savedUserId) {
        const found = profiles.find((p) => p.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          return;
        }
      }

      // If on role path, pick default user matching role
      const path = window.location.pathname || '/';
      let roleToPick: UserRole | null = null;
      if (path.startsWith('/participant')) roleToPick = 'participant';
      else if (path.startsWith('/volunteer')) roleToPick = 'volunteer';
      else if (path.startsWith('/coordinator')) roleToPick = 'coordinator';
      else if (path.startsWith('/principal')) roleToPick = 'principal';

      if (roleToPick) {
        const match = profiles.find((p) => p.role === roleToPick);
        if (match) {
          setCurrentUser(match);
          localStorage.setItem('gevents_current_user_id', match.id);
          return;
        }
      }

      // If at root '/' and no user, don't force a user so the user can choose demo identity
    } catch (err: unknown) {
      console.error('Failed to load profiles:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Database error: ${errMsg}`, 'error');
    }
  }, [repo, showToast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const switchUser = useCallback((profile: Profile) => {
    setCurrentUser(profile);
    localStorage.setItem('gevents_current_user_id', profile.id);
    showToast(`Logged in as ${profile.full_name} (${profile.role.toUpperCase()})`, 'info');
  }, [showToast]);

  const switchRole = useCallback(async (role: UserRole) => {
    let profiles = allProfiles;
    if (profiles.length === 0) {
      profiles = await repo.getProfiles();
      setAllProfiles(profiles);
    }
    const match = profiles.find((p) => p.role === role);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem('gevents_current_user_id', match.id);
      showToast(`Switched active role to ${role.toUpperCase()}`, 'info');
      // Navigate to root of that role
      navigate(`/${role}`);
    }
  }, [allProfiles, repo, showToast, navigate]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('gevents_current_user_id');
    showToast('Signed out of demonstration session', 'info');
    navigate('/');
  }, [navigate, showToast]);

  const switchDataMode = useCallback((mode: DataMode) => {
    if (mode === 'supabase' && !isSupabaseAvail) {
      showToast('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.', 'warning');
      return;
    }
    setDataMode(mode);
    localStorage.setItem('gevents_data_mode', mode);
    showToast(`Data mode switched to: ${mode === 'supabase' ? 'Supabase Live' : 'Local Demo'}`, 'info');
  }, [isSupabaseAvail, showToast]);

  const resetDemoData = useCallback(() => {
    localRepoInstance.resetDemoData();
    loadProfiles();
    showToast('Demo data reset to initial baseline successfully', 'success');
  }, [loadProfiles, showToast]);

  // Role-based route guard
  useEffect(() => {
    const path = currentPath;
    if (path === '/' || path === '') return;

    const rolePrefixes: Record<UserRole, string> = {
      participant: '/participant',
      volunteer: '/volunteer',
      coordinator: '/coordinator',
      principal: '/principal',
    };

    let targetRole: UserRole | null = null;
    for (const [r, prefix] of Object.entries(rolePrefixes)) {
      if (path.startsWith(prefix)) {
        targetRole = r as UserRole;
        break;
      }
    }

    if (targetRole) {
      if (!currentUser) {
        // Find matching profile if available
        const match = allProfiles.find((p) => p.role === targetRole);
        if (match) {
          setCurrentUser(match);
          localStorage.setItem('gevents_current_user_id', match.id);
        } else {
          // If no user set and not available yet, redirect to login
          navigate('/');
        }
      } else if (currentUser.role !== targetRole) {
        // Enforce role boundary
        showToast(`Access restricted: Your current identity (${currentUser.role}) cannot access ${targetRole} routes.`, 'warning');
        navigate(`/${currentUser.role}`);
      }
    }
  }, [currentPath, currentUser, allProfiles, navigate, showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        dataMode,
        isSupabaseAvailable: isSupabaseAvail,
        repo,
        notifications,
        currentPath,
        navigate,
        switchRole,
        switchUser,
        logout,
        switchDataMode,
        resetDemoData,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
