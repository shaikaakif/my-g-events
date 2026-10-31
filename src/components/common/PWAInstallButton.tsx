import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'welcome' | 'banner' | 'standaloneModal';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, hasPromptedOnce, markPromptSeen, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);

  // Show first-time install prompt only once on the first eligible visit
  useEffect(() => {
    if (variant === 'banner' && isInstallable && !hasPromptedOnce && !isInstalled) {
      const timer = setTimeout(() => {
        setShowFirstVisitModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [variant, isInstallable, hasPromptedOnce, isInstalled]);

  // If already running as an installed PWA
  if (isInstalled) {
    if (variant === 'welcome') {
      return (
        <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80 ${className}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>G-Events App is Installed</span>
        </div>
      );
    }
    return null;
  }

  // 1. WELCOME SCREEN VARIANT (Placed below Continue with G-Events button)
  if (variant === 'welcome') {
    return (
      <div className={`w-full max-w-sm mx-auto space-y-2 ${className}`}>
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else if (isIOS) {
              setShowIOSGuide(true);
            } else {
              alert('To install G-Events: Open your browser menu (⋮ or Share icon) and tap "Install app" or "Add to Home screen".');
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50/80 border border-emerald-200 text-stone-800 text-xs font-bold shadow-xs hover:border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
          <span>Install G-Events App</span>
          <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">• Offline & Quick Launch</span>
        </button>

        {showIOSGuide && renderIOSGuideModal(() => setShowIOSGuide(false))}
      </div>
    );
  }

  // 2. HEADER COMPACT VARIANT (Responsive: icon-only on small mobile, text on tablet+)
  if (variant === 'header') {
    const handleHeaderClick = () => {
      if (isInstallable) {
        install();
      } else if (isIOS) {
        setShowIOSGuide(true);
      } else {
        alert('To install G-Events: Open browser menu (⋮ or Share) and select "Install app" or "Add to Home screen".');
      }
    };

    return (
      <>
        <button
          onClick={handleHeaderClick}
          className={`min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            isInstallable
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
          } ${className}`}
          title="Install G-Events App"
          aria-label="Install App"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {showIOSGuide && renderIOSGuideModal(() => setShowIOSGuide(false))}
      </>
    );
  }

  // 3. ONE-TIME FIRST VISIT BANNER/MODAL
  if (showFirstVisitModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-emerald-300 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-heading text-base font-bold text-stone-900">
                  Install G-Events
                </h3>
                <p className="text-[11px] text-stone-500">
                  For fast offline passes & instant schedules
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowFirstVisitModal(false);
                markPromptSeen();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setShowFirstVisitModal(false);
                markPromptSeen();
              }}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50"
            >
              Not Now
            </button>
            <button
              onClick={async () => {
                setShowFirstVisitModal(false);
                if (isInstallable) {
                  await install();
                } else if (isIOS) {
                  setShowIOSGuide(true);
                }
              }}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

function renderIOSGuideModal(onClose: () => void) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-emerald-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading text-lg font-bold text-stone-900">
              Install on iPhone / iPad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-stone-600 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <p className="pt-0.5">
              Tap the <strong className="text-stone-900">Share</strong> icon in Safari toolbar (<Share2 className="w-3.5 h-3.5 inline text-emerald-700" />).
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <p className="pt-0.5">
              Scroll down and tap <strong className="text-stone-900">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-700" />).
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <p className="pt-0.5">
              Launch G-Events directly from your home screen with zero browser bars!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
