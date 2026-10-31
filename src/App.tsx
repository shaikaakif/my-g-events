import React from 'react';
import { AppProvider, useApp } from './lib/data/AppContext';
import { WelcomePage } from './features/welcome/WelcomePage';
import { DashboardShell } from './components/common/DashboardShell';
import { ParticipantDashboard } from './features/participant/ParticipantDashboard';
import { VolunteerDashboard } from './features/volunteer/VolunteerDashboard';
import { CoordinatorDashboard } from './features/coordinator/CoordinatorDashboard';
import { PrincipalDashboard } from './features/principal/PrincipalDashboard';
import { EventGallery } from './features/gallery/EventGallery';

const AppContent: React.FC = () => {
  const { currentPath } = useApp();

  // Root landing & persona selection
  if (currentPath === '/' || currentPath === '') {
    return <WelcomePage />;
  }

  // Campus Gallery route (accessible to all roles)
  if (currentPath.endsWith('/gallery') || currentPath === '/gallery') {
    return (
      <DashboardShell>
        <EventGallery />
      </DashboardShell>
    );
  }

  // Participant role routes
  if (currentPath.startsWith('/participant')) {
    return (
      <DashboardShell>
        <ParticipantDashboard />
      </DashboardShell>
    );
  }

  // Volunteer role routes
  if (currentPath.startsWith('/volunteer')) {
    return (
      <DashboardShell>
        <VolunteerDashboard />
      </DashboardShell>
    );
  }

  // Coordinator role routes
  if (currentPath.startsWith('/coordinator')) {
    return (
      <DashboardShell>
        <CoordinatorDashboard />
      </DashboardShell>
    );
  }

  // Principal / Admin role routes
  if (currentPath.startsWith('/principal')) {
    return (
      <DashboardShell>
        <PrincipalDashboard />
      </DashboardShell>
    );
  }

  // Fallback to Welcome
  return <WelcomePage />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
