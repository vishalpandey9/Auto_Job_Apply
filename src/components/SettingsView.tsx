import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  Shield,
  Clock,
  Briefcase,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  UserCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences, resetCV } = useApp();

  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillYears, setNewSkillYears] = useState<number>(3);
  const [newBlacklistCompany, setNewBlacklistCompany] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    updatePreferences({
      skillExperienceYears: {
        ...preferences.skillExperienceYears,
        [newSkillName.trim().toLowerCase()]: Number(newSkillYears)
      }
    });
    setNewSkillName('');
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = { ...preferences.skillExperienceYears };
    delete updated[skill];
    updatePreferences({ skillExperienceYears: updated });
  };

  const handleAddBlacklist = () => {
    if (!newBlacklistCompany.trim()) return;
    updatePreferences({
      blacklistedCompanies: [...preferences.blacklistedCompanies, newBlacklistCompany.trim()]
    });
    setNewBlacklistCompany('');
  };

  const handleRemoveBlacklist = (comp: string) => {
    updatePreferences({
      blacklistedCompanies: preferences.blacklistedCompanies.filter(c => c !== comp)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Auto-Apply Engine Configuration</span>
              <span aria-hidden="true">·</span>
              <span>LinkedIn Screening Defaults</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Automation Preferences & Screening Data
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Configure parameters for the daily 15-minute auto-apply routine, screening questionnaire responses, and exclusion filters.
            </p>
          </div>

          {savedNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Daily 15-Minute Sprint Goals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sprint Session Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={preferences.dailySprintGoalMinutes}
                onChange={e => updatePreferences({ dailySprintGoalMinutes: parseInt(e.target.value, 10) || 15 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard focus duration is 15 minutes per morning.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Daily Application Target Quota
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={preferences.dailyApplicationTarget}
                onChange={e => updatePreferences({ dailyApplicationTarget: parseInt(e.target.value, 10) || 10 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Recommended: 10-15 tailored applications per day.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Standard Employer Screening Responses</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Years of Professional Experience
              </label>
              <input
                type="number"
                value={preferences.totalYearsOfExperience}
                onChange={e => updatePreferences({ totalYearsOfExperience: parseInt(e.target.value, 10) || 5 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Annual Compensation (USD)
              </label>
              <input
                type="number"
                step={5000}
                value={preferences.expectedSalaryUSD}
                onChange={e => updatePreferences({ expectedSalaryUSD: parseInt(e.target.value, 10) || 150000 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notice Period (Days)
              </label>
              <input
                type="number"
                value={preferences.noticePeriodDays}
                onChange={e => updatePreferences({ noticePeriodDays: parseInt(e.target.value, 10) || 14 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preferred Work Mode
              </label>
              <select
                value={preferences.workModePreference}
                onChange={e => updatePreferences({ workModePreference: e.target.value as any })}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-slate-900 bg-white"
              >
                <option value="Any">Any (Remote, Hybrid, or Onsite)</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid Only</option>
                <option value="Onsite">Onsite Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.authorizedInUS}
                onChange={e => updatePreferences({ authorizedInUS: e.target.checked })}
                className="rounded text-slate-900 focus:ring-slate-900"
              />
              <span className="font-medium text-slate-800">Authorized to work in US</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.requiresSponsorship}
                onChange={e => updatePreferences({ requiresSponsorship: e.target.checked })}
                className="rounded text-slate-900 focus:ring-slate-900"
              />
              <span className="font-medium text-slate-800">Requires Visa Sponsorship</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.willingToRelocate}
                onChange={e => updatePreferences({ willingToRelocate: e.target.checked })}
                className="rounded text-slate-900 focus:ring-slate-900"
              />
              <span className="font-medium text-slate-800">Willing to Relocate</span>
            </label>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Skill Experience Years (Auto-Filled into Employer Forms)</span>
            </div>
            <span className="text-xs text-slate-400">Used for "How many years with [Skill]?"</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(preferences.skillExperienceYears).map(([skill, years]) => (
              <div
                key={skill}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-slate-800 capitalize">{skill}</div>
                  <div className="text-[11px] text-slate-500">{years} years</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs">
            <input
              type="text"
              placeholder="Skill name (e.g. Next.js, Go, Docker)"
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 flex-1 focus:outline-slate-900"
            />
            <input
              type="number"
              min={1}
              max={25}
              value={newSkillYears}
              onChange={e => setNewSkillYears(parseInt(e.target.value, 10) || 1)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 w-20 focus:outline-slate-900"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>Company Blacklist (Exclusion Filter)</span>
            </div>
            <span className="text-xs text-slate-400">Never auto-apply to these employers</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {preferences.blacklistedCompanies.map(comp => (
              <span
                key={comp}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200/80 rounded-lg"
              >
                <span>{comp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlacklist(comp)}
                  className="text-rose-500 hover:text-rose-800"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Company name to blacklist..."
              value={newBlacklistCompany}
              onChange={e => setNewBlacklistCompany(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 flex-1 focus:outline-slate-900"
            />
            <button
              type="button"
              onClick={handleAddBlacklist}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shrink-0"
            >
              Add to Blacklist
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={resetCV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Profile</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
