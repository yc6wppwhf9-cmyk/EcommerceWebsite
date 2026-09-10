import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Heart,
  Factory,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Gift,
  Sparkles,
  MapPin,
  Linkedin,
  Globe,
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const AboutUs = () => {
  const stats = [
    { value: '1999', label: 'Established', sub: '25+ Years of Industry Expertise' },
    { value: '18M+', label: 'Annual Capacity', sub: 'Bags produced per year' },
    { value: '50,000+', label: 'Delivered Daily', sub: 'Across nationwide distribution' },
    { value: '3,500+', label: 'Machines', sub: 'Robust infrastructure network' },
    { value: '8,400+', label: 'Workforce', sub: '1,400+ employees & 7,000+ workers' },
    { value: '60%', label: 'Women Workforce', sub: 'Empowering local communities' },
  ];

  const missionPoints = [
    {
      num: '01',
      title: 'Every Indian Covered',
      desc: 'To design durable, functional, and affordable bags for every Indian.',
    },
    {
      num: '02',
      title: 'Scalable Ecosystems',
      desc: 'To build scalable and efficient manufacturing ecosystems across India.',
    },
    {
      num: '03',
      title: 'Empowerment & Livelihoods',
      desc: 'To create sustainable livelihoods and empower women through meaningful employment.',
    },
    {
      num: '04',
      title: 'Responsible Growth',
      desc: 'To grow responsibly while strengthening the communities we operate in.',
    },
  ];

  const productCategories = [
    'School Bags',
    'College Backpacks',
    'Laptop Bags & Cases',
    'Duffle Bags',
    'Messenger Bags',
    'Trekking & Travel Backpacks',
    'Trolley Luggage',
  ];

  const partners = [
    'Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Reliance Retail', 'D-Mart', 'Blinkit',
    'Tata CLiQ', 'BigBasket', 'Lifestyle', 'Bata', 'FirstCry', 'MR. D.I.Y.',
    'Lee Cooper', 'Faber-Castell', 'Carrefour', 'Provogue', 'Vishal Mega Mart', 'Metro', 'Citykart'
  ];

  return (
    <main className="font-outfit bg-white text-ink min-h-screen">
      <SEO
        title="About Us — High Spirit Commercial Ventures (HSCVPL) & Priority Bags"
        description="Learn about HSCVPL, one of India's largest backpack manufacturers with 25+ years of excellence, powering Priority and Traworld brands."
        url="https://prioritybags.in/about"
      />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#26B3FF_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#26B3FF] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
              <Building2 size={14} />
              High Spirit Commercial Ventures Pvt. Ltd.
            </div>
            <h1 className="text-4xl md:text-6xl font-normal uppercase tracking-tight leading-none mb-6">
              Elevating <span className="text-[#26B3FF]">Everyday</span> Journeys
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light mb-8">
              We don&apos;t just manufacture bags, we build scale, reliability, and long-term partnerships.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/backpacks"
                className="inline-flex items-center gap-2 rounded-sm bg-[#26B3FF] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#1fa0e6] transition-colors"
              >
                Explore Products <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-sm bg-white/10 hover:bg-white/20 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white border border-white/20 transition-colors"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ─────────────────────────────────────────────────── */}
      <section className="bg-bone border-y border-line py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-sm border border-line flex flex-col justify-between">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-ink tracking-tight mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                    {stat.label}
                  </p>
                </div>
                <p className="text-[11px] text-gray-500 mt-3 border-t border-gray-100 pt-2 leading-tight">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Company Overview ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#26B3FF] mb-3">
              Our Origins & Growth
            </p>
            <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-[0.08em] text-ink mb-6 leading-tight">
              Powering Possibilities, Building Brands
            </h2>
            <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
              <p>
                At <strong>High Spirit Commercial Ventures Pvt. Ltd. (HSCVPL)</strong>, we began with bags — but what we truly carry are possibilities. Possibilities for journeys, aspirations, and communities to thrive.
              </p>
              <p>
                Founded in <strong>1999 in Surat, Gujarat</strong> as M.S. Trading by a visionary father–son duo, the company was built on a simple yet powerful vision: to create affordable, durable, and thoughtfully designed bags for every Indian. What started as a modest trading venture steadily evolved into a trusted powerhouse in India’s luggage and backpack industry.
              </p>
              <p>
                In <strong>2012–2013</strong>, the company was formally incorporated as High Spirit Commercial Ventures Pvt. Ltd. with corporate headquarters established in Chembur, Mumbai. Today, HSCVPL stands as one of the country&apos;s largest manufacturers, delivering over 50,000 bags every single day.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#FAF8F5] border border-line p-8 rounded-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3 flex items-center gap-2">
                <TrendingUp size={16} /> Rapid Manufacturing Scale
              </h3>
              <p className="text-sm text-graphite leading-relaxed">
                In 2022, HSCVPL strategically established large-scale manufacturing facilities in <strong>Muzaffarpur and Fatuha</strong> within a record 53 days, complemented by extensive job-worker networks in <strong>East Champaran</strong>.
              </p>
            </div>

            <div className="bg-ink text-white p-8 rounded-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#26B3FF] mb-3 flex items-center gap-2">
                <Sparkles size={16} /> Millions of Daily Journeys
              </h3>
              <p className="text-sm text-white/80 leading-relaxed font-light">
                From a young child stepping into school for the first time to corporate professionals traveling across borders — with every zipper closed and every journey begun, our products become a meaningful part of everyday life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Brands ───────────────────────────────────────────────────── */}
      <section className="bg-bone py-16 md:py-24 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#26B3FF] mb-3">
              Brand Portfolio
            </p>
            <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-[0.08em] text-ink mb-4">
              Our Brands
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              HSCVPL owns and manages a portfolio of brands designed to cater to diverse consumer segments, representing our commitment to design, quality, and value.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Priority Brand */}
            <div className="bg-white border border-line p-8 md:p-10 rounded-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-ink uppercase flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-[#26B3FF] inline-block rounded-xs" />
                    Priority™
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] bg-blue-50 text-[#26B3FF] px-3 py-1 rounded-full">
                    Flagship Brand
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
                  Our flagship brand, <strong>Priority</strong>, represents affordability, reliability, and accessibility. Designed for everyday use, Priority bags are widely trusted by students, working professionals, and families across India.
                </p>
                <ul className="space-y-2.5 text-xs text-graphite mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#26B3FF]" /> College, School & Everyday Backpacks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#26B3FF]" /> Rugged Trekking & Travel Gear
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#26B3FF]" /> Ergonomic Laptop Series & Pouches
                  </li>
                </ul>
              </div>
              <Link
                to="/backpacks"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#26B3FF] hover:text-ink transition-colors"
              >
                Shop Priority Collection <ArrowRight size={14} />
              </Link>
            </div>

            {/* Traworld Brand */}
            <div className="bg-ink text-white border border-ink p-8 md:p-10 rounded-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-brass inline-block rounded-xs" />
                    Traworld
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] bg-white/10 text-brass px-3 py-1 rounded-full border border-white/20">
                    Premium Travel
                  </span>
                </div>
                <p className="text-sm md:text-base text-white/80 leading-relaxed font-light mb-6">
                  Positioned in the premium travel segment, <strong>Traworld</strong> offers sophisticated luggage, duffles, and executive travel gear engineered for durability, effortless convenience, and timeless elegance.
                </p>
                <ul className="space-y-2.5 text-xs text-white/70 mb-8 font-light">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-brass" /> Hard & Soft Trolley Luggage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-brass" /> Premium Duffle & Gym Carriers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-brass" /> Executive Business Travel Organizers
                  </li>
                </ul>
              </div>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brass hover:text-white transition-colors"
              >
                Explore Traworld Premium <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Vision & Mission ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#26B3FF] mb-3">
            Driven By Purpose
          </p>
          <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-[0.08em] text-ink mb-4">
            Vision & Mission
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {/* Vision Card */}
          <div className="lg:col-span-1 bg-[#FAF8F5] border border-line p-8 rounded-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-ink border border-line mb-6">
                <ShieldCheck size={22} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass mb-3">
                Our Vision
              </p>
              <h3 className="text-xl md:text-2xl font-normal uppercase tracking-tight text-ink mb-4 leading-snug">
                India&apos;s Most Trusted Bags Company
              </h3>
              <p className="text-sm text-graphite leading-relaxed">
                To become India&apos;s most trusted and accessible bags and luggage company, delivering quality products while creating meaningful economic opportunities for communities across the country.
              </p>
            </div>
            <div className="pt-6 border-t border-line mt-6">
              <p className="text-[11px] font-medium text-slate uppercase tracking-wider">
                Reliability • Scale • Social Value
              </p>
            </div>
          </div>

          {/* Mission 4 Pillars */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {missionPoints.map((item, idx) => (
              <div key={idx} className="bg-white border border-line p-6 rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#26B3FF] uppercase tracking-widest block mb-2">
                    {item.num}
                  </span>
                  <h4 className="text-base font-semibold uppercase tracking-tight text-ink mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Impact & Women Empowerment ────────────────────────────── */}
      <section className="bg-ink text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brass mb-4">
                <Heart size={16} /> Social Impact
              </div>
              <h2 className="text-3xl md:text-5xl font-normal uppercase tracking-tight leading-tight mb-6">
                &ldquo;We don&apos;t just stitch bags, <br />
                <span className="text-[#26B3FF]">We stitch families together.</span>&rdquo;
              </h2>
              <div className="space-y-4 text-white/80 text-sm md:text-base font-light leading-relaxed">
                <p>
                  At HSCVPL, business growth goes hand in hand with social impact. Nearly <strong>60% of our total workforce comprises women</strong>, reflecting our deep commitment to women&apos;s empowerment and financial independence.
                </p>
                <p>
                  Through formal employment and work-from-home opportunities in regions such as <strong>Champaran</strong>, we enable women to earn sustainable monthly incomes often exceeding <strong>₹15,000 per month</strong>, allowing them to support their families while maintaining work-life balance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#26B3FF] mb-2">Creating</h4>
                <p className="text-lg font-bold text-white mb-1">Sustainable</p>
                <p className="text-xs text-white/60">Livelihoods & independence</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-brass mb-2">Empowering</h4>
                <p className="text-lg font-bold text-white mb-1">Communities</p>
                <p className="text-xs text-white/60">Grassroots economic growth</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-brass mb-2">Supporting</h4>
                <p className="text-lg font-bold text-white mb-1">Families</p>
                <p className="text-xs text-white/60">Education & family security</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#26B3FF] mb-2">Carrying</h4>
                <p className="text-lg font-bold text-white mb-1">Dreams</p>
                <p className="text-xs text-white/60">Building a brighter future</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Portfolio & Corporate Gifting ────────────────────────── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Portfolio */}
          <div className="bg-bone border border-line p-8 md:p-10 rounded-sm">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#26B3FF] mb-3">
              <Factory size={16} /> Complete Range
            </div>
            <h3 className="text-2xl md:text-3xl font-normal uppercase tracking-tight text-ink mb-6">
              Product Portfolio
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              HSCVPL offers a comprehensive range of bags and travel accessories designed to meet the demands of modern, dynamic lifestyles:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {productCategories.map((cat, i) => (
                <span
                  key={i}
                  className="bg-white border border-line px-3.5 py-2 rounded-sm text-xs font-medium text-graphite uppercase tracking-wider shadow-xs"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Corporate Gifting */}
          <div className="bg-white border border-line p-8 md:p-10 rounded-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brass mb-3">
                <Gift size={16} /> Bulk & Custom Solutions
              </div>
              <h3 className="text-2xl md:text-3xl font-normal uppercase tracking-tight text-ink mb-4">
                Corporate Gifting Partner
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                We work closely with organizations as a long-term gifting partner, providing customized bag solutions for employee onboarding, annual summits, corporate events, festive gifting, and promotional campaigns.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:text-[#26B3FF] transition-colors"
            >
              Enquire for Bulk / Corporate Orders <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Retail & Brand Partners ──────────────────────────────────────── */}
      <section className="bg-[#FAF8F5] py-16 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate mb-2">
              Partnership Philosophy
            </p>
            <h3 className="text-2xl md:text-3xl font-normal uppercase tracking-tight text-ink mb-3">
              Built on Trust. Driven by Growth.
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Trusted by leading national retail chains, online marketplaces, and enterprise clients across India.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 max-w-5xl mx-auto">
            {partners.map((partner, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white border border-line rounded-sm text-xs font-semibold uppercase tracking-wider text-graphite shadow-2xs hover:border-[#26B3FF] transition-colors"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Corporate Office & Contact ───────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-ink text-white p-8 md:p-12 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#26B3FF] mb-2">
              Corporate Headquarters
            </p>
            <h4 className="text-xl md:text-2xl font-normal uppercase tracking-tight mb-3">
              High Spirit Commercial Ventures Pvt. Ltd.
            </h4>
            <p className="text-xs md:text-sm text-white/70 max-w-xl flex items-start gap-2">
              <MapPin size={16} className="text-[#26B3FF] shrink-0 mt-0.5" />
              Universal Majestic Building, Ghatkopar-Mankhurd Link Road, Near RBK Kanakiya School, Chembur West, Mumbai 400043.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://in.linkedin.com/company/highspirit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider text-white transition-colors"
            >
              <Linkedin size={15} /> LinkedIn
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#26B3FF] hover:bg-[#1fa0e6] px-5 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider text-white transition-colors"
            >
              <Globe size={15} /> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
