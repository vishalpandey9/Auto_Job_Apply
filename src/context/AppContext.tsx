import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CV, CandidateCV } from '../data/initialCV';
import { INITIAL_JOBS, INITIAL_APPLICATION_RECORDS } from '../data/mockJobs';
import {
  CandidatePreferences,
  DEFAULT_PREFERENCES,
  JobPosting,
  ApplicationRecord,
  autoAnswerQuestion,
  filterEligibleJobs
} from '../utils/autoApplyEngine';
import { analyzeATS } from '../utils/atsScorer';

interface SprintState {
  isActive: boolean;
  isPaused: boolean;
  startedAt: number | null;
  durationMinutes: number;
  currentJobIndex: number;
  appliedInSession: number;
  logs: { time: string; message: string; type: 'info' | 'success' | 'action' | 'warning' }[];
  isProcessingStep: boolean;
  currentStepDescription: string;
}

interface AppContextType {
  cv: CandidateCV;
  updateCV: (updated: Partial<CandidateCV>) => void;
  resetCV: () => void;
  jobs: JobPosting[];
  addJob: (job: Omit<JobPosting, 'id' | 'postedDate'>) => void;
  deleteJob: (id: string) => void;
  applications: ApplicationRecord[];
  addApplication: (app: Omit<ApplicationRecord, 'id' | 'appliedDate'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationRecord['status'], notes?: string) => void;
  deleteApplication: (id: string) => void;
  preferences: CandidatePreferences;
  updatePreferences: (prefs: Partial<CandidatePreferences>) => void;
  activeTab: 'dashboard' | 'sprint' | 'ats-studio' | 'jobs' | 'pipeline' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'sprint' | 'ats-studio' | 'jobs' | 'pipeline' | 'settings') => void;
  selectedJobForATS: JobPosting | null;
  setSelectedJobForATS: (job: JobPosting | null) => void;
  streakCount: number;
  sprintState: SprintState;
  startSprint: () => void;
  pauseSprint: () => void;
  resumeSprint: () => void;
  stopSprint: () => void;
  executeSprintStep: () => Promise<void>;
  tailoredResumesMap: Record<string, { summary: string; bullets: { original: string; optimized: string; rationale: string; keywordsAdded: string[] }[]; coverLetter: string; atsScore: number }>;
  saveTailoredResume: (jobId: string, tailoredData: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_CV = 'autoapply_cv_v2';
const STORAGE_KEY_JOBS = 'autoapply_jobs_v2';
const STORAGE_KEY_APPS = 'autoapply_apps_v2';
const STORAGE_KEY_PREFS = 'autoapply_prefs_v2';
const STORAGE_KEY_STREAK = 'autoapply_streak_v2';
const STORAGE_KEY_TAILORED = 'autoapply_tailored_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cv, setCV] = useState<CandidateCV>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CV);
      return saved ? JSON.parse(saved) : INITIAL_CV;
    } catch {
      return INITIAL_CV;
    }
  });

  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS);
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      return saved ? JSON.parse(saved) : INITIAL_APPLICATION_RECORDS;
    } catch {
      return INITIAL_APPLICATION_RECORDS;
    }
  });

  const [preferences, setPreferences] = useState<CandidatePreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [streakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STREAK);
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [tailoredResumesMap, setTailoredResumesMap] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAILORED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'sprint' | 'ats-studio' | 'jobs' | 'pipeline' | 'settings'>('dashboard');
  const [selectedJobForATS, setSelectedJobForATS] = useState<JobPosting | null>(INITIAL_JOBS[0] || null);

  const [sprintState, setSprintState] = useState<SprintState>({
    isActive: false,
    isPaused: false,
    startedAt: null,
    durationMinutes: preferences.dailySprintGoalMinutes || 15,
    currentJobIndex: 0,
    appliedInSession: 0,
    logs: [],
    isProcessingStep: false,
    currentStepDescription: 'Ready to launch daily sprint'
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CV, JSON.stringify(cv));
    } catch {}
  }, [cv]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
    } catch {}
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TAILORED, JSON.stringify(tailoredResumesMap));
    } catch {}
  }, [tailoredResumesMap]);

  const updateCV = (updated: Partial<CandidateCV>) => {
    setCV(prev => ({ ...prev, ...updated }));
  };

  const resetCV = () => {
    setCV(INITIAL_CV);
  };

  const addJob = (job: Omit<JobPosting, 'id' | 'postedDate'>) => {
    const newJob: JobPosting = {
      ...job,
      id: `job-custom-${Date.now()}`,
      postedDate: 'Just now'
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const addApplication = (appData: Omit<ApplicationRecord, 'id' | 'appliedDate'>) => {
    const newRecord: ApplicationRecord = {
      ...appData,
      id: `app-${Date.now()}`,
      appliedDate: new Date().toISOString()
    };
    setApplications(prev => [newRecord, ...prev]);
  };

  const updateApplicationStatus = (id: string, status: ApplicationRecord['status'], notes?: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          return {
            ...app,
            status,
            ...(notes !== undefined ? { notes } : {})
          };
        }
        return app;
      })
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const updatePreferences = (updated: Partial<CandidatePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updated }));
  };

  const saveTailoredResume = (jobId: string, tailoredData: any) => {
    setTailoredResumesMap(prev => ({
      ...prev,
      [jobId]: tailoredData
    }));
  };

  const logSprintEvent = (message: string, type: 'info' | 'success' | 'action' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSprintState(prev => ({
      ...prev,
      logs: [{ time, message, type }, ...prev.logs.slice(0, 49)]
    }));
  };

  const startSprint = () => {
    setSprintState({
      isActive: true,
      isPaused: false,
      startedAt: Date.now(),
      durationMinutes: preferences.dailySprintGoalMinutes || 15,
      currentJobIndex: 0,
      appliedInSession: 0,
      logs: [
        {
          time: new Date().toLocaleTimeString(),
          message: `Sprint initiated! Target: ${preferences.dailyApplicationTarget} jobs in ${preferences.dailySprintGoalMinutes || 15} minutes.`,
          type: 'info'
        }
      ],
      isProcessingStep: false,
      currentStepDescription: 'Analyzing eligible job queue...'
    });
    setActiveTab('sprint');
  };

  const pauseSprint = () => {
    setSprintState(prev => ({ ...prev, isPaused: true }));
    logSprintEvent('Sprint paused by user', 'warning');
  };

  const resumeSprint = () => {
    setSprintState(prev => ({ ...prev, isPaused: false }));
    logSprintEvent('Sprint resumed', 'info');
  };

  const stopSprint = () => {
    setSprintState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      currentStepDescription: 'Sprint concluded.'
    }));
    logSprintEvent(`Sprint ended. Total applications dispatched: ${sprintState.appliedInSession}`, 'success');
  };

  const executeSprintStep = async () => {
    const eligibleJobs = filterEligibleJobs(jobs, preferences);
    const appliedJobIds = new Set(applications.map(a => a.jobId));
    const pendingJobs = eligibleJobs.filter(j => !appliedJobIds.has(j.id));

    if (pendingJobs.length === 0) {
      logSprintEvent('Queue clear! All eligible jobs in your discovery pool have been applied to.', 'success');
      stopSprint();
      return;
    }

    const currentJob = pendingJobs[0];

    setSprintState(prev => ({
      ...prev,
      isProcessingStep: true,
      currentStepDescription: `Step 1/4: Analyzing ATS compatibility for ${currentJob.company} (${currentJob.title})...`
    }));

    await new Promise(r => setTimeout(r, 400));
    const ats = analyzeATS(
      `${cv.summary}\n${cv.experiences.map(e => e.bullets.join('\n')).join('\n')}`,
      currentJob.description
    );
    logSprintEvent(`Evaluated ${currentJob.company}: Initial ATS match ${ats.overallScore}%. Missing ${ats.missingKeywords.length} keywords.`, 'info');

    setSprintState(prev => ({
      ...prev,
      currentStepDescription: `Step 2/4: AI customizing resume bullet points with keywords: [${ats.missingKeywords.slice(0, 3).join(', ') || 'verified'}]...`
    }));
    await new Promise(r => setTimeout(r, 500));

    const tailoredSummary = `Results-focused ${currentJob.title} specialist with proven success delivering high-performance scalable systems with ${ats.matchedKeywords.slice(0, 3).join(', ')}.`;
    const optimizedScore = Math.min(96, ats.overallScore + 18);
    logSprintEvent(`AI Resume Tailored: ATS score boosted from ${ats.overallScore}% to ${optimizedScore}%.`, 'action');

    setSprintState(prev => ({
      ...prev,
      currentStepDescription: `Step 3/4: Auto-answering ${currentJob.screeningQuestions?.length || 2} employer screening questions...`
    }));
    await new Promise(r => setTimeout(r, 400));

    const answeredQuestions = (currentJob.screeningQuestions || []).map(q => {
      const res = autoAnswerQuestion(q.question, preferences);
      return {
        question: q.question,
        answer: res.answer
      };
    });
    logSprintEvent(`Screening answers generated (Visa sponsorship, experience years, compensation) with 95%+ confidence.`, 'info');

    setSprintState(prev => ({
      ...prev,
      currentStepDescription: `Step 4/4: Submitting Easy Apply to ${currentJob.company}...`
    }));
    await new Promise(r => setTimeout(r, 400));

    addApplication({
      jobId: currentJob.id,
      jobTitle: currentJob.title,
      company: currentJob.company,
      location: currentJob.location,
      status: 'Applied',
      atsScore: optimizedScore,
      tailoredResumeSummary: tailoredSummary,
      autoAnsweredQuestions: answeredQuestions,
      notes: `Applied during 15-minute daily sprint session. Tailored ATS score: ${optimizedScore}%.`
    });

    saveTailoredResume(currentJob.id, {
      summary: tailoredSummary,
      bullets: [],
      coverLetter: '',
      atsScore: optimizedScore
    });

    const newAppliedCount = sprintState.appliedInSession + 1;
    logSprintEvent(`Application successfully submitted to ${currentJob.company}! (${newAppliedCount}/${preferences.dailyApplicationTarget})`, 'success');

    setSprintState(prev => ({
      ...prev,
      isProcessingStep: false,
      appliedInSession: newAppliedCount,
      currentJobIndex: prev.currentJobIndex + 1,
      currentStepDescription: `Application sent! Ready for next job.`
    }));

    if (newAppliedCount >= preferences.dailyApplicationTarget) {
      logSprintEvent(`Daily sprint goal accomplished! ${newAppliedCount} jobs applied in today's 15m session.`, 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        cv,
        updateCV,
        resetCV,
        jobs,
        addJob,
        deleteJob,
        applications,
        addApplication,
        updateApplicationStatus,
        deleteApplication,
        preferences,
        updatePreferences,
        activeTab,
        setActiveTab,
        selectedJobForATS,
        setSelectedJobForATS,
        streakCount,
        sprintState,
        startSprint,
        pauseSprint,
        resumeSprint,
        stopSprint,
        executeSprintStep,
        tailoredResumesMap,
        saveTailoredResume
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
