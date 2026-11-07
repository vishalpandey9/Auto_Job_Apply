import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { ApplicationRecord } from '../utils/autoApplyEngine';

const STAGES: ApplicationRecord['status'][] = [
  'Applied',
  'Reviewing',
  'Interview',
  'Offer',
  'Rejected'
];

export const PipelineView: React.FC = () => {
  const { applications, updateApplicationStatus, deleteApplication } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [noteEdit, setNoteEdit] = useState<string>('');

  const filteredApps = applications.filter(a =>
    a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAppsForStage = (stage: ApplicationRecord['status']) =>
    filteredApps.filter(a => a.status === stage);

  const handleOpenDetail = (app: ApplicationRecord) => {
    setSelectedApp(app);
    setNoteEdit(app.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedApp) return;
    updateApplicationStatus(selectedApp.id, selectedApp.status, noteEdit);
    setSelectedApp(prev => (prev ? { ...prev, notes: noteEdit } : null));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Application Pipeline & Interview Tracker</span>
              <span aria-hidden="true">·</span>
              <span>{applications.length} Total Submissions</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Application Tracker Kanban
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Track candidate status from automated submission through interview rounds and offers.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STAGES.map(stage => {
          const stageApps = getAppsForStage(stage);
          const stageColors: Record<string, string> = {
            Applied: 'border-t-sky-500',
            Reviewing: 'border-t-indigo-500',
            Interview: 'border-t-emerald-500',
            Offer: 'border-t-amber-500',
            Rejected: 'border-t-slate-400'
          };

          return (
            <div
              key={stage}
              className={`bg-slate-100/70 rounded-xl p-3 border-t-2 ${stageColors[stage] || 'border-t-slate-300'} flex flex-col min-h-[420px]`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {stage}
                </span>
                <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-2xs">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {stageApps.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No applications
                  </div>
                ) : (
                  stageApps.map(app => (
                    <div
                      key={app.id}
                      onClick={() => handleOpenDetail(app)}
                      className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-slate-900 truncate">
                          {app.company}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 shrink-0">
                          {app.atsScore}% ATS
                        </span>
                      </div>

                      <div className="text-slate-700 font-medium line-clamp-1">
                        {app.jobTitle}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>
                          {new Date(app.appliedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {app.notes && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Note
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500 mb-0.5">
                  Applied on {new Date(selectedApp.appliedDate).toLocaleDateString()}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedApp.jobTitle}
                </h3>
                <div className="text-xs font-semibold text-slate-700">
                  {selectedApp.company} · {selectedApp.location}
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Update Stage:</label>
              <div className="grid grid-cols-5 gap-1 text-xs">
                {STAGES.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      updateApplicationStatus(selectedApp.id, s);
                      setSelectedApp({ ...selectedApp, status: s });
                    }}
                    className={`py-1.5 px-2 font-medium rounded-md transition-colors text-center truncate ${
                      selectedApp.status === s
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {selectedApp.tailoredResumeSummary && (
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-700">
                  AI Tailored Resume Summary ({selectedApp.atsScore}% ATS Match):
                </label>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedApp.tailoredResumeSummary}
                </p>
              </div>
            )}

            {selectedApp.autoAnsweredQuestions && selectedApp.autoAnsweredQuestions.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-700">
                  Auto-Answered Screening Questions:
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {selectedApp.autoAnsweredQuestions.map((qa, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded-md border border-slate-100">
                      <div className="text-slate-500">{qa.question}</div>
                      <div className="text-slate-900 font-semibold mt-0.5">↳ {qa.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Candidate Notes & Next Steps:</label>
              <textarea
                rows={3}
                value={noteEdit}
                onChange={e => setNoteEdit(e.target.value)}
                placeholder="e.g. Recruiter email received. Coding challenge due by Monday..."
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs"
                >
                  Save Note
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  deleteApplication(selectedApp.id);
                  setSelectedApp(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
