import React, { useState } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { Modal } from './Modal';
import { Database, HardDrive, Check, AlertTriangle, RefreshCw, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DataModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataModeModal: React.FC<DataModeModalProps> = ({ isOpen, onClose }) => {
  const { dataMode, isSupabaseAvailable, switchDataMode, resetDemoData } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setConfirmReset(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Architecture & Active Storage Mode"
      description="G-Events operates in two explicitly separated data modes for demonstrations and production resilience."
    >
      <div className="space-y-6">
        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mode A: Local Demo Mode */}
          <div
            onClick={() => switchDataMode('demo')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
              dataMode === 'demo'
                ? 'bg-emerald-50/70 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'bg-white border-stone-200 hover:border-emerald-200 hover:bg-stone-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5" />
              </div>
              {dataMode === 'demo' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              )}
            </div>
            <h4 className="font-serif-heading font-bold text-stone-900 text-lg">Mode A: Local Demo</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Self-contained offline repository persisted deterministically in browser localStorage. Ideal for evaluations, presentations, and fast offline test runs.
            </p>
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero setup required
            </div>
          </div>

          {/* Mode B: Supabase Mode */}
          <div
            onClick={() => {
              if (isSupabaseAvailable) switchDataMode('supabase');
            }}
            className={`p-5 rounded-2xl border transition-all relative ${
              !isSupabaseAvailable ? 'opacity-80 bg-stone-50 border-stone-200 cursor-not-allowed' : 'cursor-pointer'
            } ${
              dataMode === 'supabase'
                ? 'bg-teal-50/70 border-teal-500 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/20'
                : isSupabaseAvailable
                ? 'bg-white border-stone-200 hover:border-teal-200 hover:bg-stone-50/50'
                : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              {dataMode === 'supabase' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              ) : isSupabaseAvailable ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Ready
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-200 text-stone-600">
                  Unconfigured
                </span>
              )}
            </div>
            <h4 className="font-serif-heading font-bold text-stone-900 text-lg">Mode B: Supabase Live</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Connects to live Supabase PostgreSQL tables (<code className="font-mono text-[10px]">events</code>, <code className="font-mono text-[10px]">tickets</code>, <code className="font-mono text-[10px]">profiles</code>) with strict Row Level Security.
            </p>
            <div className="mt-4 pt-3 border-t border-stone-200 flex items-center gap-2 text-xs font-medium">
              {isSupabaseAvailable ? (
                <span className="text-teal-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Keys detected in environment
                </span>
              ) : (
                <span className="text-stone-500 flex items-center gap-1">
                  <Key className="w-4 h-4" /> Requires VITE_SUPABASE_URL
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Database Integrity & Migration Note */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-stone-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Data Isolation Guarantee</span>
          </div>
          <p>
            Local demo data is strictly stored in isolated <code className="font-mono text-emerald-800">localStorage</code>. When Supabase is enabled, all reads and writes flow directly through Supabase PostgreSQL. Never will local demo writes masquerade as cloud records.
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono text-stone-500">
            <span>Migration: /supabase/migrations/001_initial_schema.sql</span>
            <span>•</span>
            <span>Seed: /supabase/seed.sql</span>
          </div>
        </div>

        {/* Reset Demo Data Action */}
        <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-stone-900">Reset Local Demonstration Data</div>
            <div className="text-xs text-stone-500">
              Restores default campus hackathon, symposium, tickets, and student schedules.
            </div>
          </div>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-xl border border-stone-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Baseline
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Confirm?
              </span>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Yes, Reset Now
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
