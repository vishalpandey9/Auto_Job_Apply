import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SprintView } from './components/SprintView';
import { ATSStudioView } from './components/ATSStudioView';
import { JobsQueueView } from './components/JobsQueueView';
import { PipelineView } from './components/PipelineView';
import { SettingsView } from './components/SettingsView';

function AppContent() {
  const { activeTab, setActiveTab, startSprint } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startSprint();
    } else if (params.get('tab')) {
      const tab = params.get('tab');
      if (['dashboard', 'sprint', 'ats-studio', 'jobs', 'pipeline', 'settings'].includes(tab!)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'sprint' && <SprintView />}
        {activeTab === 'ats-studio' && <ATSStudioView />}
        {activeTab === 'jobs' && <JobsQueueView />}
        {activeTab === 'pipeline' && <PipelineView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">AutoApply AI</span>
            <span aria-hidden="true">·</span>
            <span>Inspired by LinkedIn Auto Applier Workflows</span>
            <span aria-hidden="true">·</span>
            <span>Daily 15-Minute Habit System</span>
          </div>
          <div>
            ATS Optimization tested for Workday, Greenhouse, Lever & Taleo systems
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
