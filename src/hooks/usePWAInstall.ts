import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasPromptedOnce, setHasPromptedOnce] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('gevents_pwa_prompt_seen') === 'true';
  });

  useEffect(() => {
    // Detect standalone mode (already installed or running as installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('gevents_pwa_prompt_seen', 'true');
      setHasPromptedOnce(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const markPromptSeen = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gevents_pwa_prompt_seen', 'true');
    }
    setHasPromptedOnce(true);
  }, []);

  const install = useCallback(async () => {
    markPromptSeen();
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error during PWA installation:', err);
      return false;
    }
  }, [deferredPrompt, markPromptSeen]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    hasPromptedOnce,
    markPromptSeen,
    install,
  };
}
