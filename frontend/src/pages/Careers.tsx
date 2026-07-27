import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Send, Paperclip, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { api } from '../lib/api';
import type { Job } from '../types';

interface FormState {
  name: string;
  email: string;
  phone: string;
  position: string;
  cover_letter: string;
  resume: File | null;
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', position: '', cover_letter: '', resume: null };

export const Careers = () => {
  const { showToast } = useCart();
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getJobs({ status: 'open' })
      .then(res => setJobs(res.jobs))
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      showToast('Resume must be under 5 MB', 'error');
      return;
    }
    setForm(prev => ({ ...prev, resume: file }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.cover_letter.trim()) newErrors.cover_letter = 'Please tell us about yourself';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const selectedJob = jobs.find(j => j.title === form.position);

    try {
      // Upload the resume file first so admins get a real, openable link.
      let resumeUrl: string | undefined;
      if (form.resume) {
        try {
          resumeUrl = await api.uploadResume(form.resume);
        } catch {
          showToast('Could not upload your resume. Please try a smaller PDF/DOC and retry.', 'error');
          setSubmitting(false);
          return;
        }
      }

      await api.submitApplication(selectedJob ? selectedJob.id : 'general', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        cover_letter: form.cover_letter,
        resume_url: resumeUrl,
      });
      setForm(EMPTY_FORM);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast("Application submitted! We'll be in touch soon.", 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const applyForJob = (title: string) => {
    setForm(prev => ({ ...prev, position: title }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const inputBase = 'w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-priority-blue transition-all placeholder-gray-600 text-white';
  const errorBase = 'text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1';

  return (
    <main className="container mx-auto px-4 py-20 pt-24 md:pt-28 min-h-screen">
      <SEO
        title="Careers"
        description="Join the Priority Bags team. Browse open roles and apply to help us redefine travel gear for the next generation."
        url="https://prioritybags.in/careers"
      />

      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-outfit font-black uppercase tracking-tighter mb-4">Join the Movement</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Help us redefine travel gear for the next generation.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Job Listings */}
          <div>
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-priority-blue" />
              Current Openings
            </h2>

            {jobsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No openings right now</p>
                <p className="text-gray-300 text-xs mt-1">Send a general application below — we'd love to hear from you.</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-4">
                  {jobs.map((job, idx) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      onClick={() => applyForJob(job.title)}
                      className="p-6 border border-gray-100 rounded-2xl flex justify-between items-center hover:shadow-lg transition-all group cursor-pointer bg-white"
                    >
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-priority-blue transition-colors">{job.title}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                          {job.job_type} &nbsp;•&nbsp; {job.location}
                          {job.salary_min && ` · ₹${(job.salary_min / 100000).toFixed(1)}L`}
                          {job.salary_max && `–${(job.salary_max / 100000).toFixed(1)}L`}
                        </p>
                        {job.department && <p className="text-[10px] text-gray-300 mt-0.5 uppercase tracking-widest">{job.department}</p>}
                      </div>
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-priority-blue group-hover:text-white transition-all shrink-0">
                        <Send className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Application Form */}
          <div ref={formRef} className="bg-priority-dark p-8 md:p-12 rounded-3xl text-white scroll-mt-24">
            <h2 className="text-2xl font-black mb-2 uppercase">Apply Now</h2>
            <p className="text-gray-400 text-sm mb-8">Don't see a role? Send a general application.</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Name *</label>
                <input type="text" className={inputBase} placeholder="John Doe" value={form.name} onChange={set('name')} />
                {errors.name && <p className={errorBase}>{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email *</label>
                  <input type="email" className={inputBase} placeholder="john@example.com" value={form.email} onChange={set('email')} />
                  {errors.email && <p className={errorBase}>{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone *</label>
                  <input type="tel" className={inputBase} placeholder="+91..." value={form.phone} onChange={set('phone')} />
                  {errors.phone && <p className={errorBase}>{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Position</label>
                <select className={inputBase + ' cursor-pointer bg-[#1a1a2e]'} value={form.position} onChange={set('position')}>
                  <option value="">General Application</option>
                  {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Resume (PDF, max 5 MB)</label>
                <div
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/30 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-400 flex-1 truncate">{form.resume ? form.resume.name : 'Click to upload resume…'}</span>
                  {form.resume && (
                    <button type="button" onClick={e => { e.stopPropagation(); setForm(prev => ({ ...prev, resume: null })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-gray-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Why Priority? *</label>
                <textarea rows={4} className={inputBase} placeholder="Tell us about yourself..." value={form.cover_letter} onChange={set('cover_letter')} />
                {errors.cover_letter && <p className={errorBase}>{errors.cover_letter}</p>}
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-priority-blue text-white font-black py-4 rounded-xl hover:bg-white hover:text-priority-dark transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING…</> : 'SUBMIT APPLICATION'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
