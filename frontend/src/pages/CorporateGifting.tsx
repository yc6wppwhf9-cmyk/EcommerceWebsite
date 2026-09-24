import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  User,
  CheckCircle2,
  Sparkles,
  Send,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { api } from '../lib/api';

const QUANTITY_OPTIONS = [
  '50 – 100 pcs',
  '101 – 250 pcs',
  '251 – 500 pcs',
  '501 – 1,000 pcs',
  '1,000+ pcs',
];

const BUDGET_OPTIONS = [
  '₹500 – ₹1,000 / unit',
  '₹1,000 – ₹2,000 / unit',
  '₹2,000 – ₹3,500 / unit',
  '₹3,500 – ₹5,000 / unit',
  '₹5,000+ / unit',
  'Flexible / Open to suggestions',
];

const CATEGORY_OPTIONS = [
  'Laptop & College Backpacks',
  'Luggage & Trolley Bags',
  'Travel & Sports Duffle Bags',
  'Corporate Combo Gift Sets',
  'Pouches & Daily Accessories',
  'Custom Tailored Merchandise',
];

export const CorporateGifting: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organisation_name: '',
    email: '',
    quantity: '101 – 250 pcs',
    location: '',
    approx_budget: '₹1,000 – ₹2,000 / unit',
    category: 'Laptop & College Backpacks',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleChipSelect = (field: 'quantity' | 'approx_budget' | 'category', val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('Please enter a valid contact mobile number.');
      return;
    }
    if (!formData.organisation_name.trim()) {
      setErrorMessage('Please enter the name of your organization.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please specify the delivery location (City / State).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitCorporateInquiry(formData);
      setReferenceNumber(res.reference_number || `CORP-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Corporate inquiry error:', err);
      setErrorMessage(err.message || 'Unable to submit your requirement right now. Please try again or reach out to ayyappan.kp@hscvpl.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#111] font-outfit">
      <SEO
        title="Corporate Gifting & Bulk Orders — Priority Bags"
        description="Premium corporate gifting, custom branded backpacks, luggage, and executive duffles for organizations. Direct factory pricing, custom logo branding & pan-India delivery."
        url="https://prioritybags.in/corporate-gifting"
      />

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f1417] to-[#1a2329] text-white pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-widest text-[#F69245] mb-6">
              <Sparkles size={14} /> Official Corporate &amp; Institutional Gifting Partner
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
              Elevate Your Brand with <span className="text-[#F69245]">Custom Crafted</span> Corporate Gifting.
            </h1>
            
            <p className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed mb-8">
              From employee onboarding kits and annual rewards to festive bulk orders and executive luxury travel gear. Manufactured by <strong>High Spirit Commercial Ventures</strong> — India&apos;s leading luggage powerhouse.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">25+ Years</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Manufacturing Legacy</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#F69245]">50,000+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Bags Daily Capacity</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">Pan-India</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Doorstep Delivery</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#F69245]">100%</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Logo Customization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Form Section ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-20 -mt-8 relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden">
            
            <div className="bg-black text-white px-6 py-6 sm:px-10 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold tracking-[0.2em] text-[#F69245] uppercase">Direct Manufacturer Request</span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Corporate Requirement Form</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Fill in your bulk gifting specifications below. Our corporate gifting team will revert with tailored catalog &amp; volume quote within 24 hours.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-medium text-gray-300">
                <Briefcase size={16} className="text-[#F69245]" />
                <span>Bulk discounts apply on 50+ units</span>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center max-w-lg mx-auto"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Requirement Received!</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Thank you, <strong className="text-black">{formData.name}</strong>. Your corporate gifting inquiry for <strong className="text-black">{formData.organisation_name}</strong> has been logged successfully.
                  </p>

                  <div className="bg-[#FAF9F5] border border-black/10 rounded-xl p-5 mb-8 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Reference ID:</span>
                      <span className="font-mono font-bold text-black">{referenceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Requirement:</span>
                      <span className="font-semibold text-black">{formData.quantity} • {formData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Delivery Location:</span>
                      <span className="font-semibold text-black">{formData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Notification Sent To:</span>
                      <span className="font-medium text-black">ayyappan.kp@hscvpl.com</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        organisation_name: '',
                        email: '',
                        quantity: '101 – 250 pcs',
                        location: '',
                        approx_budget: '₹1,000 – ₹2,000 / unit',
                        category: 'Laptop & College Backpacks',
                        notes: '',
                      });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-colors"
                  >
                    Submit Another Requirement
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* ─── Part 1: Contact & Organization Details ──────────────── */}
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-400 mb-4 flex items-center gap-2">
                      <User size={14} className="text-black" /> 1. Contact &amp; Organization Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="e.g. +91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Name of Organisation */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Name of Organisation <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="organisation_name"
                            required
                            placeholder="e.g. Acme Technologies Pvt Ltd"
                            value={formData.organisation_name}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Mail ID */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Official Mail ID <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. rahul@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* ─── Part 2: Requirement Specifics ───────────────────────── */}
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-400 mb-4 flex items-center gap-2">
                      <Briefcase size={14} className="text-black" /> 2. Requirement Specifications
                    </h3>

                    <div className="space-y-6">
                      
                      {/* Specific Category */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                          Specific Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {CATEGORY_OPTIONS.map((cat) => {
                            const isSelected = formData.category === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => handleChipSelect('category', cat)}
                                className={`px-4 py-3 rounded-xl text-left text-xs font-semibold transition border ${
                                  isSelected
                                    ? 'bg-black text-white border-black shadow-sm'
                                    : 'bg-[#FAF9F5] text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantity & Budget row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Quantity */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                            Estimated Quantity <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {QUANTITY_OPTIONS.map((qty) => (
                              <button
                                key={qty}
                                type="button"
                                onClick={() => handleChipSelect('quantity', qty)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                  formData.quantity === qty
                                    ? 'bg-black text-white border-black'
                                    : 'bg-[#FAF9F5] text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {qty}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Or enter custom quantity (e.g. 750 units)"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:border-black outline-none"
                          />
                        </div>

                        {/* Approx Budget */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                            Approx. Budget (Per Unit / Range) <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {BUDGET_OPTIONS.slice(0, 4).map((bud) => (
                              <button
                                key={bud}
                                type="button"
                                onClick={() => handleChipSelect('approx_budget', bud)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                  formData.approx_budget === bud
                                    ? 'bg-black text-white border-black'
                                    : 'bg-[#FAF9F5] text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {bud}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            name="approx_budget"
                            value={formData.approx_budget}
                            onChange={handleChange}
                            placeholder="Or enter target budget (e.g. ₹1,500/bag or ₹5 Lakhs total)"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:border-black outline-none"
                          />
                        </div>

                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Delivery Location (City / State / Pincode) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="location"
                            required
                            placeholder="e.g. Mumbai, Maharashtra (Multiple branch delivery available)"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Notes / Customization Requirement */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Specific Customization &amp; Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          placeholder="Tell us about your logo printing needs, metal tag engraving, target delivery timeline, or any specific colorway requests..."
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full p-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-medium"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-w-[240px] h-14 px-8 rounded-full bg-black text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/15 hover:bg-[#1a2329] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Requirement...</span>
                        </div>
                      ) : (
                        <>
                          <span>Submit Corporate Requirement</span>
                          <Send size={15} className="text-[#F69245]" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-400 mt-3">
                      ⚡ On submission, a formal proposal with catalog &amp; volume quotation is directly routed to our Head of Corporate Accounts.
                    </p>
                  </div>

                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ─── Contact Banner ───────────────────────────────────────────────────── */}
      <section className="py-12 bg-[#F69245] text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have an urgent requirement or tender?
            </h3>
            <p className="text-black/80 text-sm font-medium mt-1">
              Speak directly with our institutional gifting desk at <span className="font-bold underline">ayyappan.kp@hscvpl.com</span>
            </p>
          </div>
          <a
            href="#corporate-form"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-900 transition-colors shrink-0"
          >
            Request Instant Quote
          </a>
        </div>
      </section>

    </div>
  );
};
export default CorporateGifting;
