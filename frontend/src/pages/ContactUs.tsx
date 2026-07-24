import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

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
    `w-full bg-gray-50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all outline-none ${
      fieldError(field) ? 'border-2 border-red-400 bg-red-50/30' : 'border border-transparent'
    }`;

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-outfit font-black uppercase tracking-tighter mb-4 text-priority-dark">Get in Touch</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Have questions about our products or your order? Our concierge team is here to help you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-priority-blue/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-priority-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Our Headquarters</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    High Spirit Commercial Ventures Pvt. Ltd.<br />
                    1009-1010, Universal Majestic Building,<br />
                    Ghatkopar- Mankhurd Link Road, Chembur West<br />
                    Mumbai, Maharashtra 400043
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-priority-blue/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-priority-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Call Us</h3>
                  <p className="text-gray-500 text-sm mb-1">+91 74004 59254</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mon - Sat: 10:00 AM - 6:30 PM</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-priority-blue/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-priority-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email Us</h3>
                  <p className="text-gray-500 text-sm">info@prioritybags.in</p>
                  <p className="text-gray-500 text-sm">sales@prioritybags.in</p>
                </div>
              </div>

              <div className="p-8 bg-priority-dark rounded-2xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4">WhatsApp Shopping</h3>
                  <p className="text-gray-400 text-sm mb-6">Experience our Digital Atelier on WhatsApp. Browse, ask, and order directly.</p>
                  <a href="https://wa.me/917400459254" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all">
                    <MessageSquare className="w-5 h-5" />
                    CHAT WITH CONCIERGE
                  </a>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Send a Message</h3>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h4 className="text-xl font-black text-green-800">Message Sent!</h4>
                <p className="text-gray-500 text-sm max-w-xs">We've received your message and will get back to you within 1–2 business days.</p>
                <p className="font-mono text-sm font-bold text-green-800">{ticketNumber}</p>
                <Link to={`/support-status?ticket=${encodeURIComponent(ticketNumber)}&email=${encodeURIComponent(submittedEmail)}`} className="text-priority-blue text-sm font-bold hover:underline">Track this request</Link>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-priority-blue text-sm font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {status === 'error' && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errorMsg}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      className={inputClass('name')}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => updateField('name', e.target.value)}
                      onBlur={() => touchField('name')}
                      aria-invalid={!!fieldError('name')}
                      aria-describedby={fieldError('name') ? 'contact-name-error' : undefined}
                      required
                    />
                    {fieldError('name') && <p id="contact-name-error" className="text-xs text-red-500 mt-1">{fieldError('name')}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      className={inputClass('email')}
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={e => updateField('email', e.target.value)}
                      onBlur={() => touchField('email')}
                      aria-invalid={!!fieldError('email')}
                      aria-describedby={fieldError('email') ? 'contact-email-error' : undefined}
                      required
                    />
                    {fieldError('email') && <p id="contact-email-error" className="text-xs text-red-500 mt-1">{fieldError('email')}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject *</label>
                  <input
                    id="contact-subject"
                    type="text"
                    className={inputClass('subject')}
                    placeholder="Inquiry about Product"
                    value={form.subject}
                    onChange={e => updateField('subject', e.target.value)}
                    onBlur={() => touchField('subject')}
                    aria-invalid={!!fieldError('subject')}
                    aria-describedby={fieldError('subject') ? 'contact-subject-error' : undefined}
                    required
                  />
                  {fieldError('subject') && <p id="contact-subject-error" className="text-xs text-red-500 mt-1">{fieldError('subject')}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message *</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    className={inputClass('message')}
                    placeholder="How can we help you today?"
                    value={form.message}
                    onChange={e => updateField('message', e.target.value)}
                    onBlur={() => touchField('message')}
                    aria-invalid={!!fieldError('message')}
                    aria-describedby={fieldError('message') ? 'contact-message-error' : undefined}
                    required
                  />
                  {fieldError('message') && <p id="contact-message-error" className="text-xs text-red-500 mt-1">{fieldError('message')}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-priority-blue text-white font-black py-4 rounded-xl hover:bg-priority-dark transition-all shadow-lg hover:shadow-priority-blue/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
