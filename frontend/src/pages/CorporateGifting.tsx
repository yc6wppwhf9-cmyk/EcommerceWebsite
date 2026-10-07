import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useInView, useScroll, useTransform } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileText,
  Palette,
  Send,
  Truck,
  User,
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

const STATS = [
  { value: 25, suffix: '+ Years', label: 'Manufacturing Legacy', accent: false },
  { value: 50000, suffix: '+', label: 'Bags Daily Capacity', accent: true },
  { text: 'Pan-India', label: 'Doorstep Delivery', accent: false },
  { value: 100, suffix: '%', label: 'Logo Customization', accent: true },
] as const;

const COLLECTIONS = [
  { title: 'College Backpacks', note: 'Onboarding & student kits', img: '/optimized/backpack-tabs/college.jpg', category: 'Laptop & College Backpacks' },
  { title: 'Laptop Bags', note: 'Everyday work essentials', img: '/optimized/backpack-tabs/laptop.jpg', category: 'Laptop & College Backpacks' },
  { title: 'Travel & Trekking', note: 'Offsites & reward trips', img: '/optimized/backpack-tabs/trekking.jpg', category: 'Travel & Sports Duffle Bags' },
  { title: 'Executive Duffles', note: 'Leadership & festive gifting', img: '/optimized/backpack-tabs/duffle.jpg', category: 'Travel & Sports Duffle Bags' },
];

const STEPS = [
  { icon: ClipboardList, title: 'Share your requirement', text: 'Tell us the category, quantity, budget and delivery city.' },
  { icon: FileText, title: 'Get a tailored quote', text: 'Our corporate team replies with a catalog and volume quote within 24 hours.' },
  { icon: Palette, title: 'Brand it your way', text: 'Logo printing, metal tags or custom colourways on every piece.' },
  { icon: Truck, title: 'Delivered pan-India', text: 'Shipped to one office or split across multiple branches.' },
];

const PROMISES = [
  'Direct from the manufacturer — High Spirit Commercial Ventures',
  'Catalog & volume quote within 24 hours',
  'Logo customization on every product',
  'Delivery to multiple branches across India',
];

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger = (delay = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

/** Counts up from 0 the first time it scrolls into view. */
const CountUp: React.FC<{ to: number }> = ({ to }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value.toLocaleString('en-IN')}</span>;
};

/** Pill option with a shared, sliding selection highlight. */
const Chip: React.FC<{
  group: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ group, selected, onClick, className = '', children }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
    aria-pressed={selected}
    className={`relative isolate border text-xs font-semibold transition-colors duration-300 ${
      selected ? 'text-white border-black' : 'bg-[#FAF9F5] text-gray-700 border-gray-200 hover:border-gray-400'
    } ${className}`}
  >
    {selected && (
      <motion.span
        layoutId={`chip-${group}`}
        className="absolute inset-0 -z-10 rounded-[inherit] bg-black"
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
    )}
    {children}
  </motion.button>
);

const inputClass =
  'w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300 text-sm font-medium';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2';

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

  const formRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroFade = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
      scrollToForm();
    } catch (err: any) {
      console.error('Corporate inquiry error:', err);
      setErrorMessage(err.message || 'Unable to submit your requirement right now. Please try again or reach out to ayyappan.kp@hscvpl.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#FCFBF8] text-[#111] font-outfit overflow-x-clip">
      <SEO
        title="Corporate Gifting & Bulk Orders — Priority Bags"
        description="Premium corporate gifting, custom branded backpacks, luggage, and executive duffles for organizations. Direct factory pricing, custom logo branding & pan-India delivery."
        url="https://prioritybags.in/corporate-gifting"
      />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative w-full bg-[#18120c] overflow-hidden">
        <motion.img
          src="/optimized/corporate/hero.jpg"
          alt="Traworld & Priority Corporate Gifting - Curated Gifts for Every Business Occasion"
          className="w-full h-auto object-cover max-h-[560px] md:max-h-[660px] lg:max-h-[760px] mx-auto block"
          style={{ y: heroY, opacity: heroFade }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          loading="eager"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#18120c] to-transparent" />
      </section>

      {/* ─── Intro, CTAs & Stats ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#18120c] to-[#0f1417] text-white pb-14 sm:pb-16 -mt-px">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto text-center pt-6 sm:pt-8"
          >
            <motion.p variants={fadeUp} className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#F69245] mb-4">
              Bulk &amp; Corporate Orders
            </motion.p>
            <motion.p variants={fadeUp} className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed">
              From employee onboarding kits and annual rewards to festive bulk orders and executive luxury travel gear. Manufactured by <strong className="text-white font-semibold">High Spirit Commercial Ventures</strong> — India&apos;s leading luggage powerhouse.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                type="button"
                onClick={scrollToForm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden inline-flex items-center gap-2.5 h-12 px-7 rounded-full bg-[#F69245] text-black text-xs font-bold uppercase tracking-[0.18em] shadow-lg shadow-[#F69245]/25"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Get a Bulk Quote</span>
                <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 text-xs font-bold uppercase tracking-[0.18em] text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors duration-300"
              >
                How it works
                <ArrowDown size={15} className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10 text-center"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <p className={`text-2xl sm:text-4xl font-extrabold tabular-nums ${stat.accent ? 'text-[#F69245]' : 'text-white'}`}>
                  {'value' in stat ? (
                    <>
                      <CountUp to={stat.value} />
                      {stat.suffix}
                    </>
                  ) : (
                    stat.text
                  )}
                </p>
                <p className="text-[11px] text-gray-400 uppercase tracking-[0.18em] mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Collections ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <motion.p variants={fadeUp} className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c96a1f] mb-3">
                What we make for teams
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold tracking-tight">
                Gifts people actually use
              </motion.h2>
            </div>
            <motion.p variants={fadeUp} className="text-sm text-gray-600 max-w-md">
              Pick a collection to start your requirement — every piece can carry your logo.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
          >
            {COLLECTIONS.map((item) => (
              <motion.button
                key={item.title}
                type="button"
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                onClick={() => {
                  handleChipSelect('category', item.category);
                  scrollToForm();
                }}
                className="group relative text-left rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-2xl hover:shadow-black/10 transition-shadow duration-500"
              >
                <div className="aspect-square overflow-hidden bg-[#f2efe8]">
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm sm:text-base font-bold leading-tight">{item.title}</p>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1">{item.note}</p>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:-rotate-45">
                    <ArrowRight size={15} />
                  </span>
                </div>
                <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Logo ready
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-[#0f1417] text-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#F69245] mb-3">
              How it works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold tracking-tight">
              From requirement to doorstep in four steps
            </motion.h2>
          </motion.div>

          <div className="relative">
            <motion.div
              aria-hidden
              className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#F69245] via-white/40 to-[#F69245] origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            />
            <motion.ol
              variants={stagger(0.18)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6"
            >
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <motion.li key={title} variants={fadeUp} className="relative text-center px-2">
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    className="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-[#18120c] border border-white/15 flex items-center justify-center shadow-lg shadow-black/40"
                  >
                    <Icon size={22} className="text-[#F69245]" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F69245] text-black text-[11px] font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </motion.div>
                  <h3 className="mt-5 text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-[260px] mx-auto">{text}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* ─── Form ─────────────────────────────────────────────────────────────── */}
      <section ref={formRef} className="py-16 sm:py-20 scroll-mt-16" id="corporate-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Side panel */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl bg-[#0f1417] text-white p-7 sm:p-8 overflow-hidden relative"
          >
            <motion.div
              aria-hidden
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#F69245]/25 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-[#F69245] mb-3">Why order with us</p>
            <h2 className="relative text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Tell us what you need. We&apos;ll handle the rest.
            </h2>
            <motion.ul
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative mt-7 space-y-4"
            >
              {PROMISES.map((line) => (
                <motion.li key={line} variants={fadeUp} className="flex gap-3 text-sm text-gray-300">
                  <BadgeCheck size={18} className="text-[#F69245] shrink-0 mt-0.5" />
                  <span>{line}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="relative mt-8 pt-6 border-t border-white/10 text-xs text-gray-400">
              Prefer email? Write to{' '}
              <a href="mailto:ayyappan.kp@hscvpl.com" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-[#F69245] transition-colors">
                ayyappan.kp@hscvpl.com
              </a>
            </div>
          </motion.aside>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="lg:col-span-8 bg-white rounded-2xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden"
          >
            <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-black/5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Corporate Requirement Form</h2>
              <p className="text-gray-500 text-sm mt-1">
                Fill in your bulk gifting specifications below. Our corporate gifting team will revert with tailored catalog &amp; volume quote within 24 hours.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="py-10 text-center max-w-lg mx-auto"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
                    className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                  >
                    <CheckCircle2 size={36} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-black mb-3">Requirement Received!</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Thank you, <strong className="text-black">{formData.name}</strong>. Your corporate gifting inquiry for <strong className="text-black">{formData.organisation_name}</strong> has been logged successfully.
                  </p>

                  <div className="bg-[#FAF9F5] border border-black/10 rounded-xl p-5 mb-8 text-left space-y-2 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Reference ID:</span>
                      <span className="font-mono font-bold text-black">{referenceNumber}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Requirement:</span>
                      <span className="font-semibold text-black text-right">{formData.quantity} • {formData.category}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 uppercase tracking-wider font-semibold">Delivery Location:</span>
                      <span className="font-semibold text-black text-right">{formData.location}</span>
                    </div>
                    <div className="flex justify-between gap-4">
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
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                  noValidate
                >
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -4, 4, 0] }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                          {errorMessage}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ─── Part 1: Contact & Organization Details ──────────────── */}
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"><User size={12} /></span>
                      1. Contact &amp; Organization Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="corp-name" className={labelClass}>
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input id="corp-name" type="text" name="name" required autoComplete="name" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="corp-phone" className={labelClass}>
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input id="corp-phone" type="tel" name="phone" required autoComplete="tel" placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="corp-org" className={labelClass}>
                          Name of Organisation <span className="text-red-500">*</span>
                        </label>
                        <input id="corp-org" type="text" name="organisation_name" required autoComplete="organization" placeholder="e.g. Acme Technologies Pvt Ltd" value={formData.organisation_name} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="corp-email" className={labelClass}>
                          Official Mail ID <span className="text-red-500">*</span>
                        </label>
                        <input id="corp-email" type="email" name="email" required autoComplete="email" placeholder="e.g. rahul@company.com" value={formData.email} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* ─── Part 2: Requirement Specifics ───────────────────────── */}
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"><Briefcase size={12} /></span>
                      2. Requirement Specifications
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <p className={labelClass}>
                          Specific Category <span className="text-red-500">*</span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {CATEGORY_OPTIONS.map((cat) => (
                            <Chip
                              key={cat}
                              group="category"
                              selected={formData.category === cat}
                              onClick={() => handleChipSelect('category', cat)}
                              className="px-4 py-3 rounded-xl text-left"
                            >
                              {cat}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className={labelClass}>
                            Estimated Quantity <span className="text-red-500">*</span>
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {QUANTITY_OPTIONS.map((qty) => (
                              <Chip
                                key={qty}
                                group="quantity"
                                selected={formData.quantity === qty}
                                onClick={() => handleChipSelect('quantity', qty)}
                                className="px-3 py-1.5 rounded-lg"
                              >
                                {qty}
                              </Chip>
                            ))}
                          </div>
                          <input
                            type="text"
                            name="quantity"
                            aria-label="Custom quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Or enter custom quantity (e.g. 750 units)"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300"
                          />
                        </div>

                        <div>
                          <p className={labelClass}>
                            Approx. Budget (Per Unit / Range) <span className="text-red-500">*</span>
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {BUDGET_OPTIONS.slice(0, 4).map((bud) => (
                              <Chip
                                key={bud}
                                group="budget"
                                selected={formData.approx_budget === bud}
                                onClick={() => handleChipSelect('approx_budget', bud)}
                                className="px-3 py-1.5 rounded-lg"
                              >
                                {bud}
                              </Chip>
                            ))}
                          </div>
                          <input
                            type="text"
                            name="approx_budget"
                            aria-label="Custom budget"
                            value={formData.approx_budget}
                            onChange={handleChange}
                            placeholder="Or enter target budget (e.g. ₹1,500/bag or ₹5 Lakhs total)"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="corp-location" className={labelClass}>
                          Delivery Location (City / State / Pincode) <span className="text-red-500">*</span>
                        </label>
                        <input id="corp-location" type="text" name="location" required placeholder="e.g. Mumbai, Maharashtra (Multiple branch delivery available)" value={formData.location} onChange={handleChange} className={inputClass} />
                      </div>

                      <div>
                        <label htmlFor="corp-notes" className={labelClass}>
                          Specific Customization &amp; Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          id="corp-notes"
                          name="notes"
                          rows={3}
                          placeholder="Tell us about your logo printing needs, metal tag engraving, target delivery timeline, or any specific colorway requests..."
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full p-4 rounded-xl border border-gray-200 bg-[#FAF9F5] focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={isSubmitting ? undefined : { scale: 1.02 }}
                      whileTap={isSubmitting ? undefined : { scale: 0.98 }}
                      className="group relative overflow-hidden w-full sm:w-auto min-w-[260px] h-14 px-8 rounded-full bg-black text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/15 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      {isSubmitting ? (
                        <span className="relative flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Requirement...
                        </span>
                      ) : (
                        <>
                          <span className="relative">Submit Corporate Requirement</span>
                          <Send size={15} className="relative text-[#F69245] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                        </>
                      )}
                    </motion.button>
                    <p className="text-xs text-gray-500 mt-3">
                      On submission, a formal proposal with catalog &amp; volume quotation is directly routed to our Head of Corporate Accounts.
                    </p>
                  </div>
                </motion.form>
              )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Creative Showcase Banner ────────────────────────────────────────── */}
      <section className="w-full bg-[#1b0826] overflow-hidden">
        <motion.img
          src="/optimized/corporate/showcase.jpg"
          alt="Priority Experiences Over Objects - Corporate Gifting Showcase"
          className="w-full h-auto object-cover max-h-[640px] mx-auto block"
          initial={{ opacity: 0, scale: 1.06 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.2, ease: EASE }}
          loading="lazy"
        />
      </section>

    </div>
    </MotionConfig>
  );
};
export default CorporateGifting;
