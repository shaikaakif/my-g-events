import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from './ToastContainer';
import { PWAInstallButton } from './PWAInstallButton';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#141A16] flex flex-col relative overflow-x-hidden">
      {/* Ambient background accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#D1FAE5]/40 rounded-full blur-[100px] pointer-events-none -z-10 animate-aurora-slow" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-[#C4B5FD]/20 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};
