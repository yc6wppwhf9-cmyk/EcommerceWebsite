import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, MessageSquare, CheckCircle, AlertCircle,
  Clock, ArrowUpRight, ArrowRight, ShieldCheck, Search,
} from 'lucide-react';
import { api } from '../lib/api';
import { SEO } from '../components/SEO';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const TOPICS = [
  'Order status',
  'Product enquiry',
  'Bulk / corporate',
  'Warranty',
  'Something else',
];

const PHONE = '+91 74004 59254';
const PHONE_TEL = '+917400459254';
const MAPS_URL = 'https://maps.google.com/?q=Universal+Majestic+Building,+Ghatkopar-Mankhurd+Link+Road,+Chembur+West,+Mumbai+400043';

export const ContactUs = () => {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', subject: '', message: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const updateField = (field: keyof ContactForm, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const touchField = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const isValid = form.name.trim().length > 0
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    && form.subject.trim().length > 0
    && form.message.trim().length >= 10;

  const fieldError = (field: keyof ContactForm): string | null => {
    if (!touched[field]) return null;
    if (field === 'name' && !form.name.trim()) return 'Name is required';
    if (field === 'email') {
      if (!form.email) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email';
    }
    if (field === 'subject' && !form.subject.trim()) return 'Subject is required';
    if (field === 'message' && form.message.trim().length < 10) return 'Message must be at least 10 characters';
    return null;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isValid) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      const result = await api.sendContactMessage(form);
      setTicketNumber(result.ticket_number);
      setSubmittedEmail(form.email);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTouched({});
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to send message. Please try again.');
    }
  };

  const inputClass = (field: keyof ContactForm) =>
    // 16px on mobile — anything smaller makes iOS Safari zoom in on focus
    `w-full rounded-xl px-4 py-3.5 text-[16px] sm:text-[15px] font-outfit outline-none transition-all placeholder:text-gray-300 ${
      fieldError(field)
        ? 'bg-red-50/40 border border-red-300 focus:ring-4 focus:ring-red-100'
        : 'bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-priority-blue focus:ring-4 focus:ring-priority-blue/10'
    }`;

  const labelClass = 'block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2';

  return (
    <main className="bg-white">
      <SEO
        title="Contact Priority Bags"
        description="Talk to the Priority Bags concierge team. WhatsApp, call, or send a message about orders, products, warranty, and bulk enquiries."
        url="https://prioritybags.in/contact"
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-priority-blue/[0.07] to-white">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-priority-blue/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 pt-16 pb-14 lg:pt-24 lg:pb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-priority-blue mb-5">Support</p>
          <h1 className="font-outfit font-black uppercase tracking-tighter text-[42px] leading-[0.95] sm:text-[64px] lg:text-[76px] text-[#0d1b2a] max-w-3xl">
            We're here<br className="hidden sm:block" /> to help
          </h1>
          <p className="mt-6 text-[16px] lg:text-[17px] text-gray-500 leading-relaxed max-w-xl">
            Questions about a product, an order, or a warranty claim? Reach the Priority
            concierge team on whichever channel suits you — every message gets a ticket number
            you can track.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              <Clock className="w-3.5 h-3.5 text-priority-blue" /> Replies in 1–2 business days
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-priority-blue" /> 12-month warranty support
            </span>
          </div>
        </div>
      </section>

      {/* ── Quick channels ─────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-10 -mt-8 lg:-mt-10 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4 lg:gap-6">
          <a
            href="https://wa.me/917400459254"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-[#0d1b2a] p-6 lg:p-7 text-white shadow-xl transition-transform duration-500 hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-green-500/20 blur-2xl" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center mb-5">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">WhatsApp shopping</p>
              <p className="font-outfit font-bold text-[18px] flex items-center gap-2">
                Chat with concierge
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </p>
              <p className="text-[13px] text-white/50 mt-1">Browse, ask, and order directly</p>
            </div>
          </a>

          <a
            href={`tel:${PHONE_TEL}`}
            className="group rounded-2xl border border-gray-100 bg-white p-6 lg:p-7 shadow-lg shadow-gray-100/60 transition-transform duration-500 hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-priority-blue/10 flex items-center justify-center mb-5">
              <Phone className="w-5 h-5 text-priority-blue" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Call us</p>
            <p className="font-outfit font-bold text-[18px] text-[#0d1b2a] flex items-center gap-2">
              {PHONE}
              <ArrowUpRight className="w-4 h-4 text-priority-blue opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </p>
            <p className="text-[13px] text-gray-400 mt-1">Mon – Sat, 10:00 AM – 6:30 PM</p>
          </a>

          <a
            href="mailto:info@prioritybags.in"
            className="group rounded-2xl border border-gray-100 bg-white p-6 lg:p-7 shadow-lg shadow-gray-100/60 transition-transform duration-500 hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-priority-blue/10 flex items-center justify-center mb-5">
              <Mail className="w-5 h-5 text-priority-blue" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Email us</p>
            <p className="font-outfit font-bold text-[18px] text-[#0d1b2a] flex items-center gap-2">
              info@prioritybags.in
              <ArrowUpRight className="w-4 h-4 text-priority-blue opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </p>
            <p className="text-[13px] text-gray-400 mt-1">
              Sales enquiries: <span className="text-gray-500">sales@prioritybags.in</span>
            </p>
          </a>
        </div>
      </section>

      {/* ── Form + details ─────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-9 lg:p-10 shadow-2xl shadow-gray-100">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="font-outfit font-black uppercase tracking-tight text-[26px] text-[#0d1b2a] mb-3">Message sent</h2>
                  <p className="text-gray-500 text-[15px] max-w-sm leading-relaxed">
                    We've received your message and will get back to you within 1–2 business days.
                    Keep this reference handy:
                  </p>
                  <p className="mt-6 inline-block rounded-xl border border-dashed border-green-300 bg-green-50/60 px-5 py-3 font-mono text-[15px] font-bold tracking-wider text-green-800">
                    {ticketNumber}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      to={`/support-status?ticket=${encodeURIComponent(ticketNumber)}&email=${encodeURIComponent(submittedEmail)}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-priority-blue px-6 py-3.5 text-[13px] font-black uppercase tracking-widest text-white transition-colors hover:bg-priority-dark"
                    >
                      Track this request <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setStatus('idle')}
                      className="rounded-xl border border-gray-200 px-6 py-3.5 text-[13px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:border-gray-300 hover:text-[#0d1b2a]"
                    >
                      Send another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-outfit font-black uppercase tracking-tight text-[26px] lg:text-[30px] text-[#0d1b2a]">Send a message</h2>
                  <p className="text-gray-400 text-[14px] mt-2 mb-8">
                    Pick a topic so we can route it to the right desk.
                  </p>

                  <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    {status === 'error' && (
                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{errorMsg}</p>
                      </div>
                    )}

                    {/* Topic chips */}
                    <div>
                      <span className={labelClass}>What's it about?</span>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map(topic => {
                          const active = form.subject === topic;
                          return (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => { updateField('subject', active ? '' : topic); touchField('subject'); }}
                              className={`rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-wider transition-all ${
                                active
                                  ? 'bg-priority-blue text-white shadow-md shadow-priority-blue/25'
                                  : 'border border-gray-200 text-gray-500 hover:border-priority-blue hover:text-priority-blue'
                              }`}
                            >
                              {topic}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className={labelClass}>Full name *</label>
                        <input
                          id="contact-name"
                          type="text"
                          className={inputClass('name')}
                          placeholder="Your name"
                          value={form.name}
                          onChange={e => updateField('name', e.target.value)}
                          onBlur={() => touchField('name')}
                          aria-invalid={!!fieldError('name')}
                          aria-describedby={fieldError('name') ? 'contact-name-error' : undefined}
                          required
                        />
                        {fieldError('name') && <p id="contact-name-error" className="text-xs text-red-500 mt-2">{fieldError('name')}</p>}
                      </div>
                      <div>
                        <label htmlFor="contact-email" className={labelClass}>Email address *</label>
                        <input
                          id="contact-email"
                          type="email"
                          className={inputClass('email')}
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => updateField('email', e.target.value)}
                          onBlur={() => touchField('email')}
                          aria-invalid={!!fieldError('email')}
                          aria-describedby={fieldError('email') ? 'contact-email-error' : undefined}
                          required
                        />
                        {fieldError('email') && <p id="contact-email-error" className="text-xs text-red-500 mt-2">{fieldError('email')}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className={labelClass}>Subject *</label>
                      <input
                        id="contact-subject"
                        type="text"
                        className={inputClass('subject')}
                        placeholder="Tell us in a few words"
                        value={form.subject}
                        onChange={e => updateField('subject', e.target.value)}
                        onBlur={() => touchField('subject')}
                        aria-invalid={!!fieldError('subject')}
                        aria-describedby={fieldError('subject') ? 'contact-subject-error' : undefined}
                        required
                      />
                      {fieldError('subject') && <p id="contact-subject-error" className="text-xs text-red-500 mt-2">{fieldError('subject')}</p>}
                    </div>

                    <div>
                      <label htmlFor="contact-message" className={labelClass}>Message *</label>
                      <textarea
                        id="contact-message"
                        rows={6}
                        className={`${inputClass('message')} resize-y`}
                        placeholder="Share order numbers, product names, or photos links — the more detail, the faster we can help."
                        value={form.message}
                        onChange={e => updateField('message', e.target.value)}
                        onBlur={() => touchField('message')}
                        aria-invalid={!!fieldError('message')}
                        aria-describedby={fieldError('message') ? 'contact-message-error' : undefined}
                        required
                      />
                      <div className="flex items-center justify-between mt-2">
                        {fieldError('message')
                          ? <p id="contact-message-error" className="text-xs text-red-500">{fieldError('message')}</p>
                          : <span />}
                        <span className="text-[11px] text-gray-300 tabular-nums">{form.message.trim().length}/4000</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full rounded-xl bg-priority-blue py-4 text-[14px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-priority-blue/25 transition-all hover:bg-priority-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === 'loading' ? 'Sending…' : 'Send message'}
                    </button>

                    <p className="text-center text-[12px] text-gray-400">
                      We only use your details to answer this request. See our{' '}
                      <Link to="/privacy" className="text-gray-500 underline underline-offset-2 hover:text-priority-blue">privacy notice</Link>.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-4">
              {/* Address */}
              <div className="rounded-2xl border border-gray-100 bg-white p-7">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-priority-blue/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-priority-blue" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black uppercase tracking-wide text-[14px] text-[#0d1b2a] mb-2">Our headquarters</h3>
                    <p className="text-gray-500 text-[14px] leading-relaxed">
                      High Spirit Commercial Ventures Pvt. Ltd.<br />
                      1009–1010, Universal Majestic Building,<br />
                      Ghatkopar–Mankhurd Link Road, Chembur West<br />
                      Mumbai, Maharashtra 400043
                    </p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest text-priority-blue hover:text-priority-dark transition-colors"
                    >
                      Get directions <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Self-serve links */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-7">
                <h3 className="font-outfit font-black uppercase tracking-wide text-[14px] text-[#0d1b2a] mb-1">Faster than writing in</h3>
                <p className="text-[13px] text-gray-400 mb-5">These handle the most common requests instantly.</p>
                <div className="space-y-2">
                  {[
                    { to: '/support-status', icon: Search, title: 'Track a request', copy: 'Check the status of a ticket you already raised' },
                    { to: '/warranty', icon: ShieldCheck, title: 'Claim warranty', copy: '12-month cover on manufacturing defects' },
                    { to: '/returns', icon: ArrowRight, title: 'Returns & refunds', copy: 'Eligibility, timelines, and how to start one' },
                  ].map(({ to, icon: Icon, title, copy }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group flex items-start gap-4 rounded-xl bg-white border border-transparent p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                    >
                      <Icon className="w-5 h-5 text-priority-blue shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-outfit font-bold text-[15px] text-[#0d1b2a]">{title}</p>
                        <p className="text-[13px] text-gray-400 leading-snug">{copy}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 shrink-0 ml-auto transition-all group-hover:text-priority-blue group-hover:-translate-y-0.5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="rounded-2xl bg-[#0d1b2a] p-7 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-priority-blue" />
                  <h3 className="font-outfit font-black uppercase tracking-wide text-[14px]">Support hours</h3>
                </div>
                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">Monday – Saturday</span>
                    <span className="font-medium">10:00 AM – 6:30 PM</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-white/50">Sunday</span>
                    <span className="font-medium text-white/60">Closed</span>
                  </div>
                </div>
                <p className="text-[13px] text-white/40 mt-5 leading-relaxed">
                  Messages sent outside these hours are picked up the next working morning.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};
