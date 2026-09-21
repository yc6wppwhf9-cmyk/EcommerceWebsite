import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, X, Briefcase, FileText } from 'lucide-react';
import { Job, Application } from '../../types';

interface AdminJobsProps {
  viewMode: 'jobs' | 'applications';
  jobs: Job[];
  applications: Application[];
  isAddingJob: boolean;
  setIsAddingJob: (v: boolean) => void;
  editingJob: Job | null;
  setEditingJob: (j: Job | null) => void;
  appFilter: string;
  setAppFilter: (f: string) => void;
  jobForm: {
    title: string;
    description: string;
    location: string;
    department: string;
    job_type: Job['job_type'];
    salary_min: number | undefined;
    salary_max: number | undefined;
    requirements: string;
    status: Job['status'];
  };
  setJobForm: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    location: string;
    department: string;
    job_type: Job['job_type'];
    salary_min: number | undefined;
    salary_max: number | undefined;
    requirements: string;
    status: Job['status'];
  }>>;
  handleSaveJob: (e: React.FormEvent) => Promise<void>;
  handleDeleteJob: (jobId: string) => Promise<void>;
  handleUpdateAppStatus: (appId: string, status: string) => Promise<void>;
  handleDeleteApplication?: (appId: string) => Promise<void>;
}

export const AdminJobs: React.FC<AdminJobsProps> = ({
  viewMode,
  jobs,
  applications,
  isAddingJob,
  setIsAddingJob,
  editingJob,
  setEditingJob,
  appFilter,
  setAppFilter,
  jobForm,
  setJobForm,
  handleSaveJob,
  handleDeleteJob,
  handleUpdateAppStatus,
  handleDeleteApplication,
}) => {
  const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-priority-blue outline-none transition-all placeholder:text-gray-400';

  if (viewMode === 'applications') {
    return (
      <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-3">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase">Job Applications</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{applications.length} total</p>
          </div>
          <select
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none"
            value={appFilter}
            onChange={e => setAppFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-3">
          {applications.filter(a => appFilter === 'all' || a.status === appFilter).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <FileText size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No applications yet</p>
            </div>
          ) : applications.filter(a => appFilter === 'all' || a.status === appFilter).map(app => (
            <div key={app.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-priority-blue/30 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <div>
                  <p className="text-sm font-black text-gray-900">{app.applicant_name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{app.applicant_email}{app.applicant_phone ? ` · ${app.applicant_phone}` : ''}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">Applied for: {app.jobs?.title || '—'} &bull; {new Date(app.applied_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={e => handleUpdateAppStatus(app.id, e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-[9px] font-black uppercase outline-none cursor-pointer ${
                      app.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        : app.status === 'shortlisted'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : app.status === 'hired'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {handleDeleteApplication && (
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Application"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              {app.cover_letter && (
                <p className="text-[11px] text-gray-600 bg-gray-50 rounded-xl p-3 line-clamp-2">{app.cover_letter}</p>
              )}
              {app.resume_url && (
                <a
                  href={app.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-priority-blue hover:underline"
                >
                  <FileText size={12} /> View Resume
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase">Job Postings</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{jobs.length} total</p>
        </div>
        {!isAddingJob && (
          <button
            onClick={() => {
              setIsAddingJob(true);
              setEditingJob(null);
              setJobForm({
                title: '',
                description: '',
                location: '',
                department: '',
                job_type: 'full-time',
                salary_min: undefined,
                salary_max: undefined,
                requirements: '',
                status: 'draft',
              });
            }}
            className="px-5 py-2.5 bg-priority-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-priority-blue/20 flex items-center gap-2"
          >
            <Plus size={14} /> New Job
          </button>
        )}
      </div>

      {isAddingJob ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl max-w-3xl">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{editingJob ? 'Edit Job' : 'Create Job'}</h3>
            <button onClick={() => { setIsAddingJob(false); setEditingJob(null); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSaveJob} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase">Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Product Designer"
                  className={inputCls}
                  value={jobForm.title}
                  onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase">Job Type *</label>
                <select
                  required
                  className={inputCls}
                  value={jobForm.job_type}
                  onChange={e => setJobForm({ ...jobForm, job_type: e.target.value as Job['job_type'] })}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase">Location *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mumbai HQ"
                  className={inputCls}
                  value={jobForm.location}
                  onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  className={inputCls}
                  value={jobForm.department}
                  onChange={e => setJobForm({ ...jobForm, department: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase">Salary Min (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 400000"
                  className={inputCls}
                  value={jobForm.salary_min ?? ''}
                  onChange={e => setJobForm({ ...jobForm, salary_min: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase">Salary Max (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 800000"
                  className={inputCls}
                  value={jobForm.salary_max ?? ''}
                  onChange={e => setJobForm({ ...jobForm, salary_max: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase">Description *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe the role..."
                className={inputCls}
                value={jobForm.description}
                onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase">Requirements</label>
              <textarea
                rows={3}
                placeholder="Skills, experience, qualifications..."
                className={inputCls}
                value={jobForm.requirements}
                onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase">Status</label>
              <select
                className={inputCls}
                value={jobForm.status}
                onChange={e => setJobForm({ ...jobForm, status: e.target.value as Job['status'] })}
              >
                <option value="draft">Draft (hidden)</option>
                <option value="open">Open (visible)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3.5 bg-priority-blue text-white rounded-xl text-xs font-black uppercase tracking-widest">
                {editingJob ? 'Update Job' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingJob(false); setEditingJob(null); }}
                className="px-8 py-3.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <Briefcase size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No job postings yet</p>
            </div>
          ) : jobs.map(job => (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-priority-blue/30 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-sm font-black text-gray-900">{job.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${job.status === 'open' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {job.location} &bull; {job.job_type}{job.salary_min ? ` · ₹${(job.salary_min / 100000).toFixed(1)}L` : ''}{job.salary_max ? `–${(job.salary_max / 100000).toFixed(1)}L` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingJob(job);
                      setJobForm({
                        title: job.title,
                        description: job.description,
                        location: job.location,
                        department: job.department || '',
                        job_type: job.job_type,
                        salary_min: job.salary_min,
                        salary_max: job.salary_max,
                        requirements: job.requirements || '',
                        status: job.status,
                      });
                      setIsAddingJob(true);
                    }}
                    className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-priority-blue/10 hover:text-priority-blue transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
