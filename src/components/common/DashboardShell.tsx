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
    <div className="min-h-screen bg-[#F9FAF8] text-[#141A16] flex flex-col relative overflow-x-hidden selection:bg-emerald-200">
      {/* Moving Aurora Ambient Effects: White & Pistachio Green Mesh */}
      <div className="fixed -top-[15%] -left-[10%] w-[750px] sm:w-[900px] h-[750px] sm:h-[900px] bg-gradient-to-br from-[#a7f3d0]/65 via-[#bbf7d0]/55 to-white/40 rounded-full blur-[130px] pointer-events-none -z-10 animate-aurora-mesh-pistachio" />
      <div className="fixed -top-[10%] -right-[15%] w-[700px] sm:w-[850px] h-[700px] sm:h-[850px] bg-gradient-to-bl from-[#dcfce7]/60 via-white/75 to-[#bbf7d0]/45 rounded-full blur-[140px] pointer-events-none -z-10 animate-aurora-mesh-pink" />
      <div className="fixed top-[25%] left-[20%] w-[650px] h-[650px] bg-gradient-to-tr from-white/80 via-[#cffafe]/35 to-[#a7f3d0]/40 rounded-full blur-[140px] pointer-events-none -z-10 animate-aurora-mesh-cyan" />
      <div className="fixed -bottom-[20%] left-[10%] w-[800px] h-[600px] bg-gradient-to-tr from-[#bbf7d0]/60 via-white/70 to-[#dcfce7]/50 rounded-full blur-[150px] pointer-events-none -z-10 animate-aurora-mesh-pistachio" />

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
