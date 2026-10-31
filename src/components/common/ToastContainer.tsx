import React from 'react';
import { useApp } from '../../lib/data/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissToast } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {notifications.map((note) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderClass = 'border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-900/5';
        
        if (note.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          borderClass = 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-900/5';
        } else if (note.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          borderClass = 'border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-900/5';
        } else if (note.type === 'info') {
          icon = <Info className="w-5 h-5 text-teal-600 shrink-0" />;
          borderClass = 'border-teal-200 bg-teal-50/95 text-teal-950 shadow-teal-900/5';
        }

        return (
          <div
            key={note.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <div className="pt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{note.message}</div>
            <button
              onClick={() => dismissToast(note.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded-lg transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
