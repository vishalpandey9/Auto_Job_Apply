import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Play,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  Calendar,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { analyzeATS } from '../utils/atsScorer';
import { cvToPlainText } from '../data/initialCV';

export const DashboardView: React.FC = () => {
  const {
    cv,
    jobs,
    applications,
    preferences,
    streakCount,
    startSprint,
    setActiveTab,
    setSelectedJobForATS,
    updateApplicationStatus
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = applications.filter(a => a.appliedDate.startsWith(todayStr));
  const appliedCountToday = todayApps.length;
  const targetCountToday = preferences.dailyApplicationTarget || 10;
  const progressPercent = Math.min(100, Math.round((appliedCountToday / targetCountToday) * 100));

  const interviewCount = applications.filter(a => a.status === 'Interview' || a.status === 'Offer').length;
  const averageATS = applications.length > 0
    ? Math.round(applications.reduce((acc, a) => acc + a.atsScore, 0) / applications.length)
    : 92;

  const appliedJobIds = new Set(applications.map(a => a.jobId));
  const upcomingJobs = jobs.filter(j => !appliedJobIds.has(j.id)).slice(0, 3);

  const cvText = cvToPlainText(cv);

  return (
    <div className="space-y-8">
      {/* 15-Minute Sprint Launch Hero */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Daily 15-Minute Routine
            </span>
            <span aria-hidden="true">·</span>
            <span>LinkedIn Auto-Apply Workflow</span>
            <span aria-hidden="true">·</span>
            <span>Target: {targetCountToday} applications/day</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Automate your job search in 15 minutes a day.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            The automated pipeline evaluates job listings, optimizes your CV for ATS filters with targeted keywords, auto-fills employer screening questionnaires, and logs every application to your dashboard.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={startSprint}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Today's 15-Min Sprint</span>
            </button>

            <button
              onClick={() => setActiveTab('ats-studio')}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-slate-300" />
              <span>Open ATS Resume Studio</span>
            </button>
          </div>
        </div>

        {/* Daily Quota Gauge in Hero */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Today's Goal Progress</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{appliedCountToday}</span>
              <span className="text-sm text-slate-400">/ {targetCountToday} applications</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Daily Habit Streak</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">{streakCount}</span>
              <span className="text-sm text-slate-400">consecutive days active</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Next milestone: 7-day badge (2 days remaining)
            </p>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">ATS Optimization Engine</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-sky-400">Gemini 3.8</span>
              <span className="text-xs text-slate-400">+ Deterministic ATS Rule Filter</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ATS Keyword & Metric Scanner Active
            </p>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Applications Sent</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{applications.length}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-medium">+{appliedCountToday} today</span>
            <span aria-hidden="true">·</span>
            <span>Target: {targetCountToday}/day</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Average ATS Match Score</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{averageATS}%</div>
          <div className="text-xs text-slate-500 mt-1">
            Optimized for Workday, Greenhouse & Lever
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Interview Callbacks</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{interviewCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            Active candidate pipeline stages
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Daily Sprint Quota</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{preferences.dailySprintGoalMinutes}m</div>
          <div className="text-xs text-slate-500 mt-1">
            Scheduled duration per day
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Jobs Queue & ATS Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Upcoming in Queue</h2>
              <p className="text-xs text-slate-500">
                Eligible jobs ready for your next 15-minute auto-apply run
              </p>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Explore all ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Queue is all caught up!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add custom job links or adjust preference filters to discover more.
                </p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
                >
                  Discover More Jobs
                </button>
              </div>
            ) : (
              upcomingJobs.map(job => {
                const ats = analyzeATS(cvText, job.description);
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-medium text-slate-900">{job.company}</span>
                          <span aria-hidden="true">·</span>
                          <span>{job.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>{job.workMode}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {job.title}
                        </h3>
                        {job.salaryRange && (
                          <div className="text-xs text-slate-600 mt-1">
                            {job.salaryRange}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                          <span>{job.source} Easy Apply</span>
                          <span aria-hidden="true">·</span>
                          <span>Posted {job.postedDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">ATS Match</div>
                          <div className="text-base font-bold text-slate-900">
                            {ats.overallScore}%
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedJobForATS(job);
                              setActiveTab('ats-studio');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Optimize CV
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJobForATS(job);
                              startSprint();
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Apply</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">ATS Optimization Guard</h2>
            <p className="text-xs text-slate-500">
              How the automated engine passes screening algorithms
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Hard Keyword Insertion</span>
                  <p className="text-slate-500 mt-0.5">
                    Extracts exact required tech tokens from the job description and injects them into bullet points without keyword stuffing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Action Verb Overhaul</span>
                  <p className="text-slate-500 mt-0.5">
                    Replaces passive phrases like "worked on" with high-impact power verbs ("Architected", "Spearheaded", "Optimized").
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Quantifiable Metrics</span>
                  <p className="text-slate-500 mt-0.5">
                    Ensures every experience entry quantifies impact with percentages, throughput, users, or cost reductions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  4
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Clean ATS Layout</span>
                  <p className="text-slate-500 mt-0.5">
                    Generates clean, single-column text layouts without complex graphical tables that break parser OCR.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('ats-studio')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Audit Master CV Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Application History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500">
              Track status, interview callbacks, and tailored ATS scores
            </p>
          </div>
          <button
            onClick={() => setActiveTab('pipeline')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Open Kanban tracker</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date Applied</th>
                  <th className="py-3 px-4">ATS Match</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.slice(0, 5).map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                      <div className="text-slate-500">{app.company}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{app.location}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.appliedDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900">{app.atsScore}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={e =>
                          updateApplicationStatus(app.id, e.target.value as any)
                        }
                        className="text-xs bg-slate-100 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-800"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveTab('pipeline')}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
