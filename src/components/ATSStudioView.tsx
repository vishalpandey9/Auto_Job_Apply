import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileCheck2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Printer,
  Check,
  RotateCcw
} from 'lucide-react';
import { analyzeATS } from '../utils/atsScorer';
import { cvToPlainText } from '../data/initialCV';
import { optimizeResumeForJob } from '../utils/aiResumeService';

export const ATSStudioView: React.FC = () => {
  const {
    cv,
    updateCV,
    jobs,
    selectedJobForATS,
    setSelectedJobForATS,
    tailoredResumesMap,
    saveTailoredResume
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'audit' | 'tailor' | 'preview'>('audit');
  const [customJD, setCustomJD] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [appliedToMasterNotice, setAppliedToMasterNotice] = useState<boolean>(false);

  const activeJob = selectedJobForATS || jobs[0];
  const activeJDText = isCustomMode ? customJD : (activeJob?.description || '');
  const activeRoleTitle = isCustomMode ? 'Custom Target Role' : (activeJob?.title || '');
  const activeCompany = isCustomMode ? 'Target Employer' : (activeJob?.company || '');

  const cvFullText = cvToPlainText(cv);
  const baseATS = analyzeATS(cvFullText, activeJDText);

  const tailoredData = activeJob ? tailoredResumesMap[activeJob.id] : null;

  const [localTailoredData, setLocalTailoredData] = useState<{
    summary: string;
    bullets: { original: string; optimized: string; rationale: string; keywordsAdded: string[] }[];
    coverLetter: string;
    atsScore: number;
    tips?: string[];
  } | null>(tailoredData || null);

  const handleRunAIOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizeResumeForJob(
        cv,
        activeJDText,
        activeRoleTitle,
        activeCompany
      );

      const tailoredResult = {
        summary: result.tailoredSummary,
        bullets: result.optimizedBullets,
        coverLetter: result.tailoredCoverLetter,
        atsScore: result.optimizedScore,
        tips: result.atsTips
      };

      setLocalTailoredData(tailoredResult);
      if (activeJob) {
        saveTailoredResume(activeJob.id, tailoredResult);
      }
      setActiveTabSub('tailor');
    } catch (err) {
      console.warn('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOptimizedBulletsToMasterCV = () => {
    if (!localTailoredData || localTailoredData.bullets.length === 0) return;

    const newExperiences = [...cv.experiences];
    if (newExperiences.length > 0) {
      newExperiences[0] = {
        ...newExperiences[0],
        bullets: localTailoredData.bullets.map(b => b.optimized)
      };
      updateCV({
        summary: localTailoredData.summary || cv.summary,
        experiences: newExperiences
      });
      setAppliedToMasterNotice(true);
      setTimeout(() => setAppliedToMasterNotice(false), 3000);
    }
  };

  const copyCleanATSText = () => {
    navigator.clipboard.writeText(cvFullText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>ATS Compliance & Keyword Optimizer</span>
              <span aria-hidden="true">·</span>
              <span>Workday · Greenhouse · Lever · Taleo Tested</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ATS Resume Studio & CV Customizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Scan your CV against employer requirements, identify missing keywords, and automatically rewrite bullet points with quantifiable impact.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunAIOptimization}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isOptimizing ? 'Optimizing with Gemini...' : 'AI Auto-Optimize for ATS'}</span>
            </button>

            <button
              onClick={copyCleanATSText}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              {copiedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNotice ? 'Copied ATS Text' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Target Job Selector & Tab Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Target Role:</span>
            {!isCustomMode ? (
              <select
                value={selectedJobForATS?.id || ''}
                onChange={e => {
                  const found = jobs.find(j => j.id === e.target.value);
                  if (found) setSelectedJobForATS(found);
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-900 max-w-xs truncate"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.company} - {j.title}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                Custom Job Description
              </span>
            )}

            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-xs text-slate-500 hover:text-slate-900 underline"
            >
              {isCustomMode ? 'Pick from saved jobs' : 'Paste custom JD'}
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTabSub('audit')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTabSub === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ATS Audit Breakdown
            </button>
            <button
              onClick={() => setActiveTabSub('tailor')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTabSub === 'tailor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Tailored Bullets {localTailoredData ? '(Ready)' : ''}
            </button>
            <button
              onClick={() => setActiveTabSub('preview')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTabSub === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Printable ATS Resume
            </button>
          </div>
        </div>

        {isCustomMode && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste Target Job Description:
            </label>
            <textarea
              rows={4}
              value={customJD}
              onChange={e => setCustomJD(e.target.value)}
              placeholder="Paste full job description text here to scan ATS match and generate tailored bullet points..."
              className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg focus:outline-slate-900"
            />
          </div>
        )}
      </div>

      {/* Primary Content based on Sub-Tab */}
      {activeTabSub === 'audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Overall ATS Score</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-900">{baseATS.overallScore}%</span>
                <span className="text-xs font-semibold text-emerald-700">
                  {baseATS.overallScore >= 80 ? 'High Match' : 'Optimization Recommended'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${baseATS.overallScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Keyword Match Rate</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {baseATS.breakdown.keywordMatchScore}%
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {baseATS.matchedKeywords.length} found · {baseATS.missingKeywords.length} missing
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Strong Action Verbs</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {baseATS.breakdown.actionVerbsScore}%
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Lead-in verbs score for bullet points
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Quantifiable Metrics</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {baseATS.breakdown.quantifiableMetricsScore}%
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {baseATS.quantifiableBulletCount} of {baseATS.totalBulletCount} bullets quantified
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Matched Keywords ({baseATS.matchedKeywords.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Present in your resume</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {baseATS.matchedKeywords.length === 0 ? (
                  <span className="text-xs text-slate-400">No matching technical keywords found.</span>
                ) : (
                  baseATS.matchedKeywords.map(kw => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-md border border-emerald-100"
                    >
                      ✓ {kw}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Missing Target Keywords ({baseATS.missingKeywords.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Required by job post</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {baseATS.missingKeywords.length === 0 ? (
                  <span className="text-xs text-emerald-700 font-medium">
                    100% keyword coverage! All target tech keywords exist in your resume.
                  </span>
                ) : (
                  baseATS.missingKeywords.map(kw => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 text-xs font-medium rounded-md border border-amber-200/80"
                    >
                      + {kw}
                    </span>
                  ))
                )}
              </div>

              {baseATS.missingKeywords.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={handleRunAIOptimization}
                    disabled={isOptimizing}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Auto-Inject Missing Keywords with AI</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              ATS Optimization Recommendations & Weak Verb Audit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="font-semibold text-slate-900">Action Verb Upgrades</div>
                {baseATS.actionVerbRecommendations.length > 0 ? (
                  <div className="space-y-1.5">
                    {baseATS.actionVerbRecommendations.map((rec, i) => (
                      <div key={i} className="text-slate-600">
                        Replace <span className="text-rose-600 line-through">"{rec.weakWord}"</span> with power verbs:{' '}
                        <span className="font-medium text-emerald-700">{rec.suggestions.join(', ')}</span>.
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No weak verbs detected. Your bullet points start with strong engineering verbs.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="font-semibold text-slate-900">Quantifiable Metrics Audit</div>
                <p className="text-slate-600 leading-relaxed">
                  ATS parsers reward candidates who quantify outcomes. Ensure each bullet includes:
                </p>
                <div className="text-slate-500 space-y-1">
                  <div>• Percentage improvement (e.g. "reduced latency by 42%")</div>
                  <div>• Volume or throughput (e.g. "serving 500k+ active users")</div>
                  <div>• Team scale or efficiency (e.g. "accelerated deployment duration by 60%")</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Tailored Bullets View */}
      {activeTabSub === 'tailor' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI ATS Optimization Generated</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Your resume was tailored for <span className="font-semibold">{activeRoleTitle}</span> at <span className="font-semibold">{activeCompany}</span>.
                Missing keywords were woven into bullet points alongside quantifiable metrics.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={applyOptimizedBulletsToMasterCV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {appliedToMasterNotice ? '✓ Applied to Master CV' : 'Apply to Master CV'}
              </button>
            </div>
          </div>

          {localTailoredData?.summary && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Tailored Executive Summary
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {localTailoredData.summary}
              </p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Experience Bullet Points Before & After
                </h3>
                <p className="text-xs text-slate-500">
                  Notice the injection of required ATS keywords and verified metrics
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(localTailoredData?.bullets || []).map((bullet, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">
                        Original Bullet
                      </span>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {bullet.original}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        ATS-Optimized Bullet
                      </span>
                      <p className="text-slate-900 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 font-medium">
                        {bullet.optimized}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      <strong className="text-slate-700">ATS Rationale:</strong> {bullet.rationale}
                    </span>
                    {bullet.keywordsAdded.length > 0 && (
                      <span className="text-emerald-700 font-medium">
                        Keywords added: {bullet.keywordsAdded.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {localTailoredData?.coverLetter && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Matching Tailored Cover Letter
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(localTailoredData.coverLetter);
                    setCopiedNotice(true);
                    setTimeout(() => setCopiedNotice(false), 2000);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Letter</span>
                </button>
              </div>

              <pre className="text-xs font-sans text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {localTailoredData.coverLetter}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Printable / Clean ATS Format View */}
      {activeTabSub === 'preview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Clean ATS Document Preview
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Single-Column Standard Layout
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF</span>
            </button>
          </div>

          <div className="text-slate-800 text-xs font-sans leading-relaxed space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-slate-900">{cv.fullName}</h1>
              <p className="text-slate-600 font-medium">{cv.headline}</p>
              <p className="text-slate-500">
                {cv.location} · {cv.email} · {cv.phone} · {cv.linkedinUrl}
              </p>
            </div>

            <div className="space-y-1 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Professional Summary
              </h3>
              <p className="text-slate-700">{cv.summary}</p>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Technical Skills
              </h3>
              <div className="space-y-1 text-slate-700">
                <div><strong>Languages:</strong> {cv.skills.languages.join(', ')}</div>
                <div><strong>Frameworks & Libraries:</strong> {cv.skills.frameworks.join(', ')}</div>
                <div><strong>Databases:</strong> {cv.skills.databases.join(', ')}</div>
                <div><strong>Cloud & DevOps:</strong> {cv.skills.cloudAndDevOps.join(', ')}</div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Professional Experience
              </h3>
              {cv.experiences.map(exp => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.title} — {exp.company}</span>
                    <span>{exp.period}</span>
                  </div>
                  <div className="text-slate-500 italic">{exp.location}</div>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-700">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Education & Certifications
              </h3>
              {cv.education.map((edu, i) => (
                <div key={i} className="flex justify-between text-slate-700">
                  <span><strong>{edu.degree}</strong>, {edu.institution}</span>
                  <span>{edu.year}</span>
                </div>
              ))}
              {cv.certifications.map((cert, i) => (
                <div key={i} className="text-slate-700">
                  • {cert}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
