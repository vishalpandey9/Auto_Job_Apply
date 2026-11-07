import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { analyzeATS } from '../utils/atsScorer';
import { cvToPlainText } from '../data/initialCV';

export const JobsQueueView: React.FC = () => {
  const {
    cv,
    jobs,
    addJob,
    deleteJob,
    applications,
    setSelectedJobForATS,
    setActiveTab,
    startSprint
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('Remote');
  const [newWorkMode, setNewWorkMode] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  const [newSalary, setNewSalary] = useState<string>('$160,000 - $190,000');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newSkills, setNewSkills] = useState<string>('React, TypeScript, Node.js, AWS');

  const cvText = cvToPlainText(cv);
  const appliedJobIds = new Set(applications.map(a => a.jobId));

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = filterMode === 'All' || job.workMode === filterMode;
    return matchesSearch && matchesMode;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    addJob({
      title: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim(),
      workMode: newWorkMode,
      salaryRange: newSalary.trim(),
      easyApply: true,
      source: 'LinkedIn',
      description: newDescription.trim() || `${newTitle} at ${newCompany}. Working with modern cloud technologies.`,
      requiredSkills: newSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      screeningQuestions: [
        { id: 'q1', question: 'How many years of work experience do you have with TypeScript?', type: 'number' },
        { id: 'q2', question: 'Will you now or in the future require visa sponsorship?', type: 'boolean' }
      ]
    });

    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Job Discovery & Easy Apply Queue</span>
              <span aria-hidden="true">·</span>
              <span>{jobs.length} Positions Available</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Job Queue & Discovery Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Curated roles matched to your skillset. Each position can be tailored and applied to during your 15-minute daily sprint.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Job</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by role title, company, or keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {['All', 'Remote', 'Hybrid', 'Onsite'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map(job => {
          const ats = analyzeATS(cvText, job.description);
          const isApplied = appliedJobIds.has(job.id);

          return (
            <div
              key={job.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                isApplied ? 'border-slate-200 opacity-80' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-900">{job.company}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.workMode}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {job.title}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      ATS Score
                    </div>
                    <div className={`text-base font-bold ${
                      ats.overallScore >= 80 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {ats.overallScore}%
                    </div>
                  </div>
                </div>

                {job.salaryRange && (
                  <div className="text-xs font-medium text-emerald-700 mt-2">
                    {job.salaryRange}
                  </div>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {job.requiredSkills.slice(0, 5).map(skill => {
                    const matched = ats.matchedKeywords.includes(skill.toLowerCase());
                    return (
                      <span
                        key={skill}
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          matched
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                  {job.requiredSkills.length > 5 && (
                    <span className="text-[11px] text-slate-400 px-1 py-0.5">
                      +{job.requiredSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{job.source} Easy Apply</span>
                  <span aria-hidden="true">·</span>
                  <span>{job.postedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedJobForATS(job);
                      setActiveTab('ats-studio');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Optimize CV</span>
                  </button>

                  {!isApplied ? (
                    <button
                      onClick={() => {
                        setSelectedJobForATS(job);
                        startSprint();
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Apply</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Applied</span>
                    </span>
                  )}

                  <button
                    onClick={() => deleteJob(job.id)}
                    aria-label={`Delete ${job.title}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Custom Job Posting</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GitHub"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={newWorkMode}
                    onChange={e => setNewWorkMode(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-slate-900 bg-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Salary</label>
                <input
                  type="text"
                  placeholder="e.g. Remote (US) / $165,000"
                  value={newSalary}
                  onChange={e => setNewSalary(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, GraphQL, AWS"
                  value={newSkills}
                  onChange={e => setNewSkills(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  placeholder="Paste snippet or full job description for ATS matching..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
