import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Play,
  Pause,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Building2,
  Layers,
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { calculateSprintMetrics, filterEligibleJobs } from '../utils/autoApplyEngine';
import { analyzeATS } from '../utils/atsScorer';
import { cvToPlainText } from '../data/initialCV';

export const SprintView: React.FC = () => {
  const {
    cv,
    jobs,
    applications,
    preferences,
    sprintState,
    startSprint,
    pauseSprint,
    resumeSprint,
    stopSprint,
    executeSprintStep,
    setActiveTab,
    setSelectedJobForATS
  } = useApp();

  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(true);
  const [timerDisplay, setTimerDisplay] = useState<string>('15:00');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(15 * 60);

  const eligibleJobs = filterEligibleJobs(jobs, preferences);
  const appliedJobIds = new Set(applications.map(a => a.jobId));
  const pendingJobs = eligibleJobs.filter(j => !appliedJobIds.has(j.id));
  const currentJob = pendingJobs[0] || null;

  const cvText = cvToPlainText(cv);
  const currentATS = currentJob ? analyzeATS(cvText, currentJob.description) : null;

  const autoPilotTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sprintState.isActive && !sprintState.isPaused && sprintState.startedAt) {
      interval = setInterval(() => {
        const metrics = calculateSprintMetrics(
          sprintState.startedAt!,
          sprintState.durationMinutes,
          sprintState.appliedInSession,
          preferences.dailyApplicationTarget
        );
        setTimerDisplay(metrics.formattedTimeRemaining);
        setTimeRemainingSeconds(Math.floor(metrics.remainingMs / 1000));

        if (metrics.isComplete) {
          stopSprint();
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sprintState.isActive, sprintState.isPaused, sprintState.startedAt, sprintState.appliedInSession]);

  useEffect(() => {
    if (
      isAutoPilot &&
      sprintState.isActive &&
      !sprintState.isPaused &&
      !sprintState.isProcessingStep &&
      pendingJobs.length > 0 &&
      sprintState.appliedInSession < preferences.dailyApplicationTarget
    ) {
      autoPilotTimerRef.current = setTimeout(() => {
        executeSprintStep();
      }, 1400);
    }

    return () => {
      if (autoPilotTimerRef.current) {
        clearTimeout(autoPilotTimerRef.current);
      }
    };
  }, [
    isAutoPilot,
    sprintState.isActive,
    sprintState.isPaused,
    sprintState.isProcessingStep,
    sprintState.appliedInSession,
    pendingJobs.length
  ]);

  const target = preferences.dailyApplicationTarget || 10;
  const progressPercent = Math.min(100, Math.round((sprintState.appliedInSession / target) * 100));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Daily Focus Routine</span>
              <span aria-hidden="true">·</span>
              <span>15 Minutes</span>
              <span aria-hidden="true">·</span>
              <span>Target: {target} applications</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              15-Minute Auto-Apply Sprint Session
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Automates LinkedIn Easy Apply applications with AI resume bullet optimization and ATS keyword filtering.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 px-5 py-3 rounded-xl shrink-0">
            <div className="text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Sprint Clock
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900">
                {sprintState.isActive ? timerDisplay : `${preferences.dailySprintGoalMinutes}:00`}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              {!sprintState.isActive ? (
                <button
                  onClick={startSprint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Sprint</span>
                </button>
              ) : (
                <>
                  {sprintState.isPaused ? (
                    <button
                      onClick={resumeSprint}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseSprint}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={stopSprint}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress & Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Sprint Application Progress</span>
              <span className="font-bold text-slate-900">
                {sprintState.appliedInSession} / {target} jobs completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setIsAutoPilot(true)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  isAutoPilot ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Auto-Pilot Loop
              </button>
              <button
                onClick={() => setIsAutoPilot(false)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  !isAutoPilot ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supervised Step-by-Step
              </button>
            </div>

            {sprintState.isActive && !isAutoPilot && (
              <button
                disabled={sprintState.isProcessingStep || pendingJobs.length === 0}
                onClick={executeSprintStep}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Apply Next Job</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Active Pipeline & Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Current Processing Target
                </span>
                {sprintState.isProcessingStep && (
                  <span className="text-xs text-emerald-700 font-medium animate-pulse">
                    ● Processing Live
                  </span>
                )}
              </div>
              {currentJob && (
                <span className="text-xs text-slate-500 font-medium">
                  {currentJob.source} Easy Apply
                </span>
              )}
            </div>

            {currentJob ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">{currentJob.company}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentJob.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentJob.workMode}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentJob.title}
                  </h2>
                  {currentJob.salaryRange && (
                    <div className="text-xs font-medium text-emerald-700 mt-1">
                      {currentJob.salaryRange}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-800">
                    Automated Application Pipeline
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">1. ATS Match Analysis</span>
                      </div>
                      <span className="text-slate-600 font-medium">
                        Initial ATS: {currentATS?.overallScore || 78}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">2. AI Bullet & Keyword Tailoring</span>
                      </div>
                      <span className="text-emerald-700 font-medium">
                        Boosted: ~{Math.min(96, (currentATS?.overallScore || 78) + 18)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">3. Employer Screening Auto-Fill</span>
                      </div>
                      <span className="text-slate-600 font-medium">
                        {currentJob.screeningQuestions?.length || 2} questions mapped
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">4. Easy Apply Dispatch</span>
                      </div>
                      <span className="text-slate-600 font-medium">
                        Automated submission
                      </span>
                    </div>
                  </div>
                </div>

                {currentJob.screeningQuestions && currentJob.screeningQuestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-800">
                      Auto-Answered Screening Questions Preview
                    </div>
                    <div className="space-y-1.5">
                      {currentJob.screeningQuestions.slice(0, 3).map((sq, i) => (
                        <div key={sq.id || i} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="text-slate-600 font-medium">{sq.question}</div>
                          <div className="text-slate-900 font-semibold mt-1 flex items-center gap-1.5">
                            <span className="text-emerald-600">✓ Auto-filled:</span>
                            <span>
                              {sq.question.toLowerCase().includes('sponsorship')
                                ? preferences.requiresSponsorship ? 'Yes' : 'No'
                                : sq.question.toLowerCase().includes('years')
                                ? `${preferences.totalYearsOfExperience} years`
                                : sq.question.toLowerCase().includes('salary')
                                ? `$${preferences.expectedSalaryUSD.toLocaleString()}/yr`
                                : 'Yes (Qualified)'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{sprintState.currentStepDescription}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-slate-900">Sprint Queue Completed!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  You have applied to all available eligible jobs in your discovery pool. Good job maintaining your daily habit!
                </p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
                >
                  Explore More Jobs
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-slate-600" />
                <span>Live Automation Stream</span>
              </h2>
              <span className="text-[11px] text-slate-400">Real-time trace</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sprintState.logs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Sprint logs will stream here once the session starts.
                </div>
              ) : (
                sprintState.logs.map((log, index) => {
                  return (
                    <div
                      key={index}
                      className="text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-start gap-2"
                    >
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                        {log.time}
                      </span>
                      <div className="flex-1">
                        <span
                          className={`font-medium ${
                            log.type === 'success'
                              ? 'text-emerald-700'
                              : log.type === 'action'
                              ? 'text-sky-700'
                              : log.type === 'warning'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Queue Up Next ({pendingJobs.length})
              </h3>
              <button
                onClick={() => setActiveTab('jobs')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Manage Pool
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingJobs.slice(0, 4).map((j, i) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between text-xs p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{j.title}</div>
                    <div className="text-slate-500">{j.company} · {j.workMode}</div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
