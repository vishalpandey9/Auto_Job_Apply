/**
 * Auto-Apply Automation Engine & 15-Minute Sprint Logic
 * Inspired by LinkedIn Auto Applier workflows
 */

export interface CandidatePreferences {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  currentRole: string;
  totalYearsOfExperience: number;
  skillExperienceYears: Record<string, number>;
  expectedSalaryUSD: number;
  noticePeriodDays: number;
  requiresSponsorship: boolean;
  authorizedInUS: boolean;
  willingToRelocate: boolean;
  workModePreference: 'Remote' | 'Hybrid' | 'Onsite' | 'Any';
  dailySprintGoalMinutes: number; // default 15
  dailyApplicationTarget: number; // e.g. 10
  blacklistedCompanies: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  salaryRange?: string;
  postedDate: string;
  easyApply: boolean;
  source: 'LinkedIn' | 'Indeed' | 'Company Career' | 'Wellfound';
  description: string;
  requiredSkills: string[];
  screeningQuestions?: {
    id: string;
    question: string;
    type: 'number' | 'boolean' | 'choice' | 'text';
    options?: string[];
  }[];
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string; // ISO date
  status: 'Queued' | 'Tailoring' | 'Applied' | 'Reviewing' | 'Interview' | 'Offer' | 'Rejected';
  atsScore: number;
  tailoredResumeSummary?: string;
  notes?: string;
  autoAnsweredQuestions?: { question: string; answer: string }[];
  sprintSessionId?: string;
}

export const DEFAULT_PREFERENCES: CandidatePreferences = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan.dev@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA (Open to Remote)',
  headline: 'Senior Full Stack Engineer | React, TypeScript, Node.js & Cloud Architecture',
  currentRole: 'Senior Software Engineer',
  totalYearsOfExperience: 6,
  skillExperienceYears: {
    'typescript': 5,
    'react': 6,
    'node.js': 5,
    'javascript': 6,
    'python': 4,
    'postgresql': 4,
    'aws': 4,
    'docker': 4,
    'graphql': 3,
    'ci/cd': 4,
    'system design': 5,
    'tailwind': 3
  },
  expectedSalaryUSD: 165000,
  noticePeriodDays: 14,
  requiresSponsorship: false,
  authorizedInUS: true,
  willingToRelocate: false,
  workModePreference: 'Any',
  dailySprintGoalMinutes: 15,
  dailyApplicationTarget: 10,
  blacklistedCompanies: ['BadCompany Inc', 'SpamRecruiter LLC']
};

/**
 * Deterministic Auto-Answer for Application Screening Questions
 */
export function autoAnswerQuestion(
  question: string,
  prefs: CandidatePreferences
): { answer: string; confidence: number; reasoning: string } {
  const q = question.toLowerCase();

  // 1. Sponsorship / Authorization
  if (q.includes('sponsorship') || q.includes('visa')) {
    const val = prefs.requiresSponsorship ? 'Yes' : 'No';
    return {
      answer: val,
      confidence: 98,
      reasoning: `Based on your profile sponsorship setting: ${val}`
    };
  }
  if (q.includes('authorized to work') || q.includes('legal authorization') || q.includes('legally authorized')) {
    const val = prefs.authorizedInUS ? 'Yes' : 'No';
    return {
      answer: val,
      confidence: 99,
      reasoning: 'Profile confirmed legal authorization to work.'
    };
  }

  // 2. Experience with specific skill
  const skillMatch = Object.keys(prefs.skillExperienceYears).find(skill =>
    q.includes(skill.toLowerCase())
  );
  if (skillMatch && (q.includes('how many years') || q.includes('years of experience'))) {
    const years = prefs.skillExperienceYears[skillMatch];
    return {
      answer: `${years}`,
      confidence: 95,
      reasoning: `Matched skill '${skillMatch}' with ${years} years on your profile.`
    };
  }

  // General total experience
  if (q.includes('total years') || q.includes('overall experience') || (q.includes('years of') && q.includes('software'))) {
    return {
      answer: `${prefs.totalYearsOfExperience}`,
      confidence: 92,
      reasoning: `Matched total professional experience: ${prefs.totalYearsOfExperience} years.`
    };
  }

  // 3. Compensation / Salary
  if (q.includes('desired salary') || q.includes('compensation expectation') || q.includes('expected salary')) {
    return {
      answer: `$${prefs.expectedSalaryUSD.toLocaleString()}/yr`,
      confidence: 90,
      reasoning: `Filled with your target compensation: $${prefs.expectedSalaryUSD.toLocaleString()}`
    };
  }

  // 4. Notice period
  if (q.includes('notice period') || q.includes('start date') || q.includes('soon can you start')) {
    return {
      answer: `${prefs.noticePeriodDays} days notice`,
      confidence: 92,
      reasoning: `Profile configured notice period: ${prefs.noticePeriodDays} days.`
    };
  }

  // 5. Relocation
  if (q.includes('relocate') || q.includes('relocation')) {
    return {
      answer: prefs.willingToRelocate ? 'Yes' : 'No',
      confidence: 90,
      reasoning: `Profile willing to relocate is set to ${prefs.willingToRelocate ? 'Yes' : 'No'}.`
    };
  }

  // 6. Remote / Hybrid comfort
  if (q.includes('comfortable working remote') || q.includes('remote') || q.includes('hybrid')) {
    return {
      answer: 'Yes',
      confidence: 95,
      reasoning: 'Profile supports Remote/Hybrid flexibility.'
    };
  }

  // 7. Background check or drug test
  if (q.includes('background check') || q.includes('drug screen')) {
    return {
      answer: 'Yes',
      confidence: 95,
      reasoning: 'Standard consent to background check verification.'
    };
  }

  return {
    answer: 'Yes',
    confidence: 70,
    reasoning: 'Standard affirmative answer for candidate screening.'
  };
}

/**
 * Filter jobs according to candidate blacklist and work preferences
 */
export function filterEligibleJobs(jobs: JobPosting[], prefs: CandidatePreferences): JobPosting[] {
  return jobs.filter(job => {
    // Check blacklist
    const isBlacklisted = prefs.blacklistedCompanies.some(bc =>
      job.company.toLowerCase().includes(bc.toLowerCase())
    );
    if (isBlacklisted) return false;

    // Check work mode
    if (prefs.workModePreference !== 'Any' && job.workMode !== prefs.workModePreference) {
      return false;
    }

    return true;
  });
}

/**
 * Calculates sprint statistics and remaining time
 */
export function calculateSprintMetrics(
  startTimeMs: number,
  durationMinutes: number,
  appliedCount: number,
  targetCount: number
) {
  const elapsedMs = Math.max(0, Date.now() - startTimeMs);
  const totalMs = durationMinutes * 60 * 1000;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const progressPercent = Math.min(100, Math.round((appliedCount / Math.max(1, targetCount)) * 100));
  const timeProgressPercent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

  const remainingSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTimeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    elapsedMs,
    remainingMs,
    formattedTimeRemaining,
    progressPercent,
    timeProgressPercent,
    isComplete: remainingMs === 0 || appliedCount >= targetCount
  };
}
