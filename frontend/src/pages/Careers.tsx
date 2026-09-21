import React, { useEffect, useRef, useState } from 'react';
import {
  Briefcase, Send, Paperclip, X, Loader2, Sparkles,
  Mail, MapPin, CheckCircle2, Clock, Users, ArrowUpRight,
  ShieldCheck, Rocket, HeartHandshake
} from 'lucide-react';
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

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  position: '',
  cover_letter: '',
  resume: null,
};

const HR_EMAIL = 'humanresource@prioritybags.in';

const PERKS = [
  {
    icon: Rocket,
    title: 'High-Impact Work',
    desc: 'Shape products used by millions of students, commuters, and travelers across India.',
  },
  {
    icon: HeartHandshake,
    title: 'People-First Culture',
    desc: 'Empowering environment built on trust, creative freedom, and shared ownership.',
  },
  {
    icon: ShieldCheck,
    title: 'Career Acceleration',
    desc: 'Clear pathways for leadership, competitive compensation, and continuous learning.',
  },
];

export const Careers = () => {
  const { showToast } = useCart();
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getJobs({ status: 'open' })
      .then(res => setJobs(res.jobs || []))
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
      showToast('Resume file must be under 5 MB', 'error');
      return;
    }
    setForm(prev => ({ ...prev, resume: file }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.cover_letter.trim()) newErrors.cover_letter = 'Please provide a brief note or cover letter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const selectedJob = jobs.find(j => j.title === form.position);

    try {
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
      setSubmittedSuccessfully(true);
      showToast("Application submitted successfully! We'll review and get in touch.", 'success');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application. Please email HR directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const applyForJob = (title: string) => {
    setForm(prev => ({ ...prev, position: title }));
    setSubmittedSuccessfully(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-[#fafafa] font-outfit text-gray-900 pt-20 pb-28">
      <SEO
        title="Careers & Opportunities"
        description="Join the Priority Bags and TRAWORLD team. Explore open roles and build the future of travel and everyday gear."
        url="https://prioritybags.in/careers"
      />

      {/* ── 1. Hero Header ── */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-12 sm:pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 shadow-2xs">
            <Sparkles size={13} className="text-priority-blue" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
              Careers at Priority Bags
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-gray-900 leading-[1.08]">
            Join Our Team
          </h1>

          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
            We are engineering the next generation of backpacks, luggage, and everyday carry gear for millions of Indian customers. Bring your passion and let’s create together.
          </p>

          {/* Quick HR Direct Link Pill */}
          <div className="pt-2">
            <a
              href={`mailto:${HR_EMAIL}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-800 transition-all hover:border-black shadow-2xs group"
            >
              <Mail size={13} className="text-priority-blue group-hover:scale-110 transition-transform" />
              <span>Direct Inquiries: <strong className="text-priority-blue font-extrabold">{HR_EMAIL}</strong></span>
              <ArrowUpRight size={12} className="text-gray-400 group-hover:text-black" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── 2. Culture & Perks ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERKS.map((perk, idx) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-black group-hover:text-white text-gray-800 flex items-center justify-center transition-colors mb-5">
                <perk.icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{perk.title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. Main Content Grid (Openings + Application Form) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ── Left Column: Openings & Info ── */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2.5">
                    <Briefcase size={20} className="text-priority-blue" />
                    Open Roles
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Explore available positions across teams</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-priority-blue border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                  {jobs.length} {jobs.length === 1 ? 'Opening' : 'Openings'}
                </span>
              </div>

              {jobsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(n => (
                    <div key={n} className="h-28 bg-white rounded-2xl border border-gray-100 p-6 animate-pulse" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                /* No Openings Clean Card */
                <div className="bg-white rounded-2xl p-7 border border-gray-200/80 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">No Active Openings Right Now</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                      We don’t have active vacancies published right now, but we are always excited to discover great talent.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-600 font-medium">
                      Submit a <strong>General Application</strong> on the right, or drop your CV at{' '}
                      <a href={`mailto:${HR_EMAIL}`} className="text-priority-blue font-bold hover:underline">
                        {HR_EMAIL}
                      </a>.
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3.5">
                    {jobs.map((job, idx) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => applyForJob(job.title)}
                        className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-black shadow-2xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-priority-blue bg-blue-50 px-2 py-0.5 rounded-md">
                              {job.department || 'General'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                              {job.job_type}
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-gray-900 group-hover:text-priority-blue transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-gray-400" />
                              {job.location}
                            </span>
                            {job.salary_min && (
                              <span>
                                · ₹{(job.salary_min / 100000).toFixed(1)}L{job.salary_max ? `–${(job.salary_max / 100000).toFixed(1)}L` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Click to apply</span>
                          <span className="text-xs font-bold text-black group-hover:text-priority-blue flex items-center gap-1">
                            Apply <Send size={12} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* HR Contact & Office Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-800 flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Human Resources Team</h4>
                  <p className="text-[11px] text-gray-500">Priority Bags Corporate Office</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 text-xs text-gray-600 font-medium border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <a href={`mailto:${HR_EMAIL}`} className="text-priority-blue font-bold hover:underline">
                    {HR_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">Applications reviewed within 3-5 business days</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: High-End Application Form ── */}
          <div ref={formRef} className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xl">
              
              {submittedSuccessfully ? (
                /* Success Message */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-black uppercase text-gray-900">Application Received!</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto font-medium">
                    Thank you for applying. Our talent team will review your profile and reach out via email/phone if your background aligns with our needs.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmittedSuccessfully(false)}
                      className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Application Form */
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
                      Submit Application
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                      Select a role or submit a general inquiry to our hiring team.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={set('name')}
                        className={`w-full bg-[#f8f9fa] border ${errors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                      {errors.name && <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1">{errors.name}</p>}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="rahul@example.com"
                          value={form.email}
                          onChange={set('email')}
                          className={`w-full bg-[#f8f9fa] border ${errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all`}
                        />
                        {errors.email && <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1">{errors.email}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-700">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={set('phone')}
                          className={`w-full bg-[#f8f9fa] border ${errors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all`}
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Position Applied For */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-700">
                        Position of Interest
                      </label>
                      <select
                        value={form.position}
                        onChange={set('position')}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer"
                      >
                        <option value="">General Application (Open Inquiry)</option>
                        {jobs.map(j => (
                          <option key={j.id} value={j.title}>
                            {j.title} {j.department ? `(${j.department})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resume Upload Dropzone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-700 flex items-center justify-between">
                        <span>Resume / CV (PDF or DOC)</span>
                        <span className="text-[9px] font-bold text-gray-400">Max 5 MB</span>
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 bg-[#f8f9fa] hover:bg-[#f1f3f5] border border-dashed border-gray-300 rounded-xl px-4 py-3.5 cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-black shrink-0">
                          <Paperclip size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {form.resume ? (
                            <span className="text-xs font-bold text-gray-900 truncate block">
                              {form.resume.name} ({(form.resume.size / 1024).toFixed(0)} KB)
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 block">
                              Click to attach or upload your resume...
                            </span>
                          )}
                        </div>
                        {form.resume && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm(prev => ({ ...prev, resume: null }));
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove file"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* Cover Letter / Tell Us About Yourself */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-700">
                        Why Priority & About You <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your background, relevant experience, and what excites you about working at Priority Bags..."
                        value={form.cover_letter}
                        onChange={set('cover_letter')}
                        className={`w-full bg-[#f8f9fa] border ${errors.cover_letter ? 'border-red-400 bg-red-50/20' : 'border-gray-200'} rounded-xl p-4 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all resize-y`}
                      />
                      {errors.cover_letter && <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1">{errors.cover_letter}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            Submit Application <Send size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};
