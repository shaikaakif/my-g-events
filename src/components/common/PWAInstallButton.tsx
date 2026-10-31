import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running as an installed PWA or dismissed on banner, hide
  if (isInstalled || isDismissed) {
    return null;
  }

  // Header compact button
  if (variant === 'header') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          title="Install G-Events on your device"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
            title="Install on iOS"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
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
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
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
                      Tap the <strong className="text-stone-900">Share</strong> icon in the Safari toolbar (<Share2 className="w-3.5 h-3.5 inline text-emerald-700" />).
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
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </>
      );
    }

    // Always offer a manual Install trigger button even before browser triggers prompt
    return (
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else if (isIOS) {
            setShowIOSGuide(true);
          } else {
            alert('To install G-Events: Open your browser menu (⋮ or Share) and select "Install app" or "Add to Home screen".');
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
        title="Install G-Events App"
      >
        <Download className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // Mobile Bottom/Floating Banner variant
  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md border border-emerald-300 shadow-xl rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xs shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <div className="font-serif-heading font-bold text-xs text-stone-900">
            Install G-Events PWA
          </div>
          <p className="text-[11px] text-stone-500 leading-tight">
            Fast offline access, native feel, and live event updates.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else if (isIOS) {
              setShowIOSGuide(true);
            } else {
              alert('Tap browser settings (⋮ or Share) and select "Install app" or "Add to Home screen".');
            }
          }}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          Install
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-stone-400 hover:text-stone-700"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSGuide(false)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600">
              1. Tap Safari <strong>Share</strong> button.<br />
              2. Select <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
