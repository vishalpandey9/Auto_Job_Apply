import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Clock,
  Play,
  Briefcase,
  FileText,
  Sliders,
  Layers,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, streakCount, sprintState, startSprint } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sprint', label: '15m Sprint', icon: Clock, highlight: sprintState.isActive },
    { id: 'ats-studio', label: 'ATS Resume Studio', icon: FileText },
    { id: 'jobs', label: 'Jobs Queue', icon: Briefcase },
    { id: 'pipeline', label: 'Tracker', icon: Layers },
    { id: 'settings', label: 'Preferences', icon: Sliders }
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">
                  AutoApply AI
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  v2.4 · LinkedIn Auto Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Daily 15-Min Application Sprint & ATS Optimizer
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.id === 'sprint' && sprintState.isActive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 border border-amber-200/60 rounded-lg text-xs font-medium text-amber-900">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{streakCount} Day Streak</span>
            </div>

            {!sprintState.isActive ? (
              <button
                onClick={startSprint}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start 15m Sprint</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('sprint')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Sprint In Progress</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md shrink-0 ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
