import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Linkedin,
  Mail,
  FileText,
  Download,
  ExternalLink,
  X,
  ChevronDown,
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const AboutUs: React.FC = () => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const pdfUrl = '/HSCVPL_Profile_2026.pdf';

  const stats = [
    { value: '1999', label: 'Established' },
    { value: '25+', label: 'Years of industry expertise' },
    { value: '50,000+', label: 'Bags delivered every day' },
    { value: '18M+', label: 'Annual production capacity' },
    { value: '3,500+', label: 'Machines' },
  ];

  const mfgStats = [
    { strong: 'Muzaffarpur & Fatuha', span: 'Production units' },
    { strong: '53 days', span: 'Facility establishment' },
    { strong: '1,400+ employees', span: 'Growing workforce' },
    { strong: '7,000+ workers', span: 'Across the workforce ecosystem' },
    { strong: '50,000+ bags', span: 'Delivered every day' },
    { strong: '18M+ bags', span: 'Annual production capacity' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="font-outfit bg-white text-[#172022] min-h-screen selection:bg-[#0aa6b5] selection:text-white">
      <SEO
        title="About Us — High Spirit Commercial Ventures (HSCVPL) & Priority Bags"
        description="Learn about HSCVPL, one of India's largest backpack manufacturers with 25+ years of excellence, powering Priority and Traworld brands."
        url="https://prioritybags.in/about"
      />

      {/* ─── In-Page Secondary Sticky Navigation ─────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#dfe6e4] transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/about/15_highspirit_logo.png"
              alt="High Spirit Commercial Ventures"
              className="h-7 w-auto object-contain"
            />
            <span className="hidden sm:inline-block text-[11px] font-semibold text-gray-400 tracking-wider uppercase border-l border-gray-200 pl-3">
              About Us
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-5 text-xs font-semibold uppercase tracking-wider text-[#667174]">
            <button
              onClick={() => scrollToSection('story')}
              className="hover:text-[#0aa6b5] transition-colors py-1 cursor-pointer hidden md:inline-block"
            >
              Our Story
            </button>
            <button
              onClick={() => scrollToSection('brands')}
              className="hover:text-[#0aa6b5] transition-colors py-1 cursor-pointer hidden sm:inline-block"
            >
              Brands
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="hover:text-[#0aa6b5] transition-colors py-1 cursor-pointer hidden sm:inline-block"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('manufacturing')}
              className="hover:text-[#0aa6b5] transition-colors py-1 cursor-pointer hidden md:inline-block"
            >
              Manufacturing
            </button>
            <button
              onClick={() => scrollToSection('impact')}
              className="hover:text-[#0aa6b5] transition-colors py-1 cursor-pointer hidden lg:inline-block"
            >
              Impact
            </button>
            <button
              onClick={() => scrollToSection('partners')}
              className="hover:text-[#0aa6b5] transition-colors py-1 cursor-pointer hidden md:inline-block"
            >
              Partners
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0aa6b5] text-[#0aa6b5] hover:bg-[#0aa6b5] hover:text-white transition-all text-[11px] font-bold cursor-pointer"
            >
              <FileText size={13} />
              <span>PDF Profile</span>
            </button>

            <button
              onClick={() => scrollToSection('contact')}
              className="px-4 py-1.5 rounded-full bg-[#101617] text-white hover:bg-[#0aa6b5] transition-colors text-[11px] font-bold cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <header className="relative min-h-[640px] md:min-h-[740px] flex items-end overflow-hidden bg-[#141919]">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(5,20,22,0.92) 0%, rgba(7,20,22,0.65) 45%, rgba(7,12,13,0.35) 100%), url('/about/01_aerial_factory_1.png')",
          }}
        />

        {/* Diagonal Teal-Green Accent Polygon */}
        <div
          className="absolute -left-[6%] -bottom-[16%] w-[75%] md:w-[62%] h-[75%] opacity-75 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, rgba(0,166,181,0.88), rgba(105,211,74,0.78))',
            clipPath: 'polygon(0 12%, 100% 0, 83% 100%, 0 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 text-white">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#69d34a] text-xs font-bold uppercase tracking-[0.22em] mb-6">
              <Building2 size={14} />
              High Spirit Commercial Ventures Pvt. Ltd.
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-[-0.05em] leading-[0.92] mb-7">
              Elevating <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0aa6b5] via-[#26B3FF] to-[#69d34a]">
                Everyday
              </span> <br />
              Journeys.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mb-9">
              We don&apos;t just manufacture bags. We build scale, reliability, and long-term partnerships.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollToSection('story')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#111] hover:bg-[#0aa6b5] hover:text-white transition-all text-xs font-black uppercase tracking-[0.16em] cursor-pointer shadow-lg"
              >
                Explore Highspirit <ChevronDown size={15} />
              </button>

              <button
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all text-xs font-bold uppercase tracking-[0.16em] cursor-pointer backdrop-blur-sm"
              >
                <FileText size={15} /> View Corporate PDF
              </button>

              <a
                href={pdfUrl}
                download="HSCVPL_Profile_2026.pdf"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Story Section ────────────────────────────────────────────────── */}
      <section id="story" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 scroll-mt-14">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
              We, Highspirit
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.04em] text-[#172022] leading-[1.0] mb-6">
              Powering possibilities. <br />
              Building brands.
            </h2>
            <p className="text-base sm:text-lg text-[#667174] leading-relaxed mb-6 font-normal">
              Established in 1999, with over 25 years of industry expertise, HSCVPL has grown into one of India’s largest backpack manufacturers, trusted by retailers, key partners and consumers.
            </p>
            <p className="text-sm text-[#667174] leading-relaxed">
              From our modern manufacturing hubs to grassroots women-led production networks, we combine massive scale with strict quality assurance to deliver superior bags for every walk of life.
            </p>
          </div>

          <div className="h-[380px] sm:h-[480px] lg:h-[540px] rounded-lg overflow-hidden shadow-xl border border-[#dfe6e4] group">
            <img
              src="/about/02_aerial_factory_2.png"
              alt="Highspirit manufacturing landscape"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-[#dfe6e4] rounded-lg overflow-hidden mt-16 bg-[#f4f7f6] shadow-sm">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-6 sm:p-8 bg-white border-[#dfe6e4] flex flex-col justify-center ${
                i !== stats.length - 1 ? 'border-r sm:border-r' : ''
              } ${i === stats.length - 1 ? 'col-span-2 sm:col-span-1 border-t sm:border-t-0' : ''}`}
            >
              <strong className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.04em] block bg-clip-text text-transparent bg-gradient-to-r from-[#08a6b5] to-[#67d44b]">
                {stat.value}
              </strong>
              <span className="text-xs sm:text-sm text-[#667174] mt-2 block font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Origins & Growth Section ─────────────────────────────────────── */}
      <section className="bg-[#f4f7f6] py-20 md:py-28 border-y border-[#dfe6e4]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="h-[380px] sm:h-[480px] lg:h-[560px] rounded-lg overflow-hidden shadow-lg border border-[#dfe6e4] order-2 md:order-1 group">
              <img
                src="/about/03_aerial_factory_3.png"
                alt="Highspirit manufacturing facility"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="order-1 md:order-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
                Our Origins · Growth & Expansion
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-[#172022] leading-[1.05] mb-6">
                From a trading venture to a trusted industry name.
              </h2>
              <p className="text-base sm:text-lg text-[#667174] leading-relaxed mb-8">
                At HSCVPL, we began with bags — but what we truly carry are possibilities for journeys, aspirations, and communities to thrive.
              </p>

              {/* Timeline */}
              <div className="border-l-2 border-[#cbd5d3] pl-6 space-y-8 ml-2">
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#0aa6b5] ring-4 ring-[#f4f7f6]" />
                  <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#0aa6b5] block mb-1">
                    1999 · SURAT, GUJARAT
                  </span>
                  <h3 className="text-xl font-bold text-[#172022] mb-1.5">M.S. Trading begins</h3>
                  <p className="text-sm text-[#667174] leading-relaxed">
                    Founded by a visionary father–son duo to create affordable, durable and thoughtfully designed bags for every Indian.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#0aa6b5] ring-4 ring-[#f4f7f6]" />
                  <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#0aa6b5] block mb-1">
                    2012–2013 · MUMBAI
                  </span>
                  <h3 className="text-xl font-bold text-[#172022] mb-1.5">HSCVPL incorporated</h3>
                  <p className="text-sm text-[#667174] leading-relaxed">
                    Formally incorporated as High Spirit Commercial Ventures Pvt. Ltd., with corporate headquarters established in Chembur, Mumbai.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#67d44b] ring-4 ring-[#f4f7f6]" />
                  <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#67d44b] block mb-1">
                    TODAY · INDIA
                  </span>
                  <h3 className="text-xl font-bold text-[#172022] mb-1.5">Built for everyday journeys</h3>
                  <p className="text-sm text-[#667174] leading-relaxed">
                    Our products accompany millions of people across India — from school journeys to corporate professional travel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Vision & Mission (Dark Section) ──────────────────────────────── */}
      <section className="bg-[#101718] text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
              Driven by Purpose
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] leading-tight">
              A vision built around quality, <br />
              <span className="text-[#69d34a]">access and opportunity.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Vision Box */}
            <div className="lg:col-span-5 p-8 md:p-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0aa6b5]/10 border border-[#0aa6b5]/30 text-[#0aa6b5] flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
                  Our Vision
                </h3>
                <p className="text-base text-[#bfc9c8] leading-relaxed font-light">
                  To become India’s most trusted and accessible bags and luggage company, delivering quality products while creating meaningful economic opportunities for communities across the country.
                </p>
              </div>
              <div className="pt-6 border-t border-white/10 mt-8 flex items-center gap-2 text-xs font-bold text-[#0aa6b5] uppercase tracking-wider">
                <CheckCircle2 size={14} /> Reliability · Scale · Community
              </div>
            </div>

            {/* Mission Box */}
            <div className="lg:col-span-7 p-8 md:p-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#69d34a]/10 border border-[#69d34a]/30 text-[#69d34a] flex items-center justify-center mb-6">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
                  Our Mission
                </h3>
                <ol className="space-y-4">
                  {[
                    'To design durable, functional, and affordable bags for every Indian.',
                    'To build scalable and efficient manufacturing ecosystems across India.',
                    'To create sustainable livelihoods and empower women through meaningful employment.',
                    'To grow responsibly while strengthening the communities we operate in.',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm sm:text-base text-[#bfc9c8] font-light">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 text-[#69d34a] flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Brands Section ───────────────────────────────────────────────── */}
      <section id="brands" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 scroll-mt-14">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
            Our Brands
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] text-[#172022] leading-tight mb-4">
            Design. Quality. Value.
          </h2>
          <p className="text-base text-[#667174]">
            HSCVPL owns and manages a portfolio of market-leading brands designed to cater to diverse consumer segments with distinct needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Priority Brand */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#f4f6f5] border border-[#dfe6e4] flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <img
                  src="/about/priority_logo.png"
                  alt="Priority Logo"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] bg-[#0aa6b5]/10 text-[#0aa6b5] px-3 py-1 rounded-full border border-[#0aa6b5]/20">
                  Flagship Brand
                </span>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-[#172022] mb-3">
                Priority
              </h3>
              <p className="text-sm sm:text-base text-[#667174] leading-relaxed mb-6">
                Our flagship brand, representing affordability, reliability, and accessibility. Designed for everyday use and trusted by students, professionals and families across India.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['School & College', 'Laptop Backpacks', 'Trekking & Travel', 'Everyday Carriers'].map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white text-[11px] font-semibold text-[#172022] border border-[#dfe6e4]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            <Link
              to="/backpacks"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0aa6b5] hover:text-[#172022] transition-colors"
            >
              Shop Priority Collection <ArrowRight size={15} />
            </Link>
          </div>

          {/* Traworld Brand */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#101718] text-white border border-[#101718] flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <img
                  src="/about/traworld_logo.png"
                  alt="Traworld Logo"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] bg-white/10 text-[#69d34a] px-3 py-1 rounded-full border border-white/20">
                  Premium Travel
                </span>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-3">
                Traworld
              </h3>
              <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-6 font-light">
                Positioned in the premium travel segment, Traworld offers sophisticated luggage and travel gear built for durability, effortless convenience, and modern elegance.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Hard & Soft Trolleys', 'Executive Organizers', 'Premium Duffels', 'Cabin Luggage'].map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white/10 text-[11px] font-semibold text-white/90 border border-white/15"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#69d34a] hover:text-white transition-colors"
            >
              Explore Traworld Premium <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Product Portfolio ────────────────────────────────────────────── */}
      <section id="products" className="bg-[#f4f7f6] py-20 md:py-28 border-y border-[#dfe6e4] scroll-mt-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
              Product Portfolio
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] text-[#172022] leading-tight mb-4">
              Made for every kind of journey.
            </h2>
            <p className="text-base text-[#667174]">
              HSCVPL offers a comprehensive range of bags and travel accessories designed to meet diverse lifestyles.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main Feature Card */}
            <div className="lg:col-span-7 h-[420px] sm:h-[520px] relative rounded-xl overflow-hidden shadow-md group bg-white border border-[#dfe6e4]">
              <img
                src="/about/12_product_collection_cutout.png"
                alt="Bags and luggage collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute left-6 bottom-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-lg shadow-md border border-[#dfe6e4]">
                <span className="text-xs font-black uppercase tracking-wider text-[#172022]">
                  School Bags · Backpacks · Luggage
                </span>
              </div>
            </div>

            {/* Side Cards */}
            <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="h-[240px] lg:h-[247px] relative rounded-xl overflow-hidden shadow-md group bg-white border border-[#dfe6e4]">
                <img
                  src="/about/11_product_collection.png"
                  alt="Travel and lifestyle collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute left-5 bottom-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-md border border-[#dfe6e4]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#172022]">
                    Travel & Lifestyle
                  </span>
                </div>
              </div>

              <div className="h-[240px] lg:h-[247px] relative rounded-xl overflow-hidden shadow-md group bg-white border border-[#dfe6e4]">
                <img
                  src="/about/04_backpack_manufacturing_closeup.png"
                  alt="Backpack manufacturing close-up"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute left-5 bottom-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-md border border-[#dfe6e4]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#172022]">
                    Built with Care & Precision
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Manufacturing Excellence ─────────────────────────────────────── */}
      <section id="manufacturing" className="bg-[#edf4f1] py-20 md:py-28 scroll-mt-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
                Manufacturing Excellence
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] text-[#172022] leading-[1.05] mb-6">
                Speed. Scale. <br />
                Operational excellence.
              </h2>
              <p className="text-base sm:text-lg text-[#667174] leading-relaxed mb-8">
                In 2022, HSCVPL strategically established large-scale manufacturing facilities in <strong>Muzaffarpur and Fatuha within 53 days</strong>, complemented by extensive job-worker ecosystems across Bihar.
              </p>

              {/* Manufacturing Stats Table */}
              <div className="grid sm:grid-cols-2 border border-[#d7e2df] rounded-xl overflow-hidden bg-white shadow-sm">
                {mfgStats.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 border-[#d7e2df] ${idx % 2 === 0 ? 'sm:border-r' : ''} ${
                      idx < mfgStats.length - 2 ? 'border-b' : ''
                    }`}
                  >
                    <strong className="text-lg font-black text-[#172022] block">
                      {item.strong}
                    </strong>
                    <span className="text-xs text-[#667174] mt-1 block">
                      {item.span}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-[360px] sm:h-[460px] rounded-xl overflow-hidden shadow-lg border border-[#d7e2df] group">
                <img
                  src="/about/08_factory_floor_wide_1.png"
                  alt="High Spirit manufacturing floor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Auxiliary mini-gallery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-36 rounded-lg overflow-hidden border border-[#d7e2df] group">
                  <img
                    src="/about/10_manufacturing_facility_building.png"
                    alt="Facility Exterior"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="h-36 rounded-lg overflow-hidden border border-[#d7e2df] group">
                  <img
                    src="/about/05_sewing_machine_closeup.png"
                    alt="Industrial Sewing Machine"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Impact Section ────────────────────────────────────────── */}
      <section
        id="impact"
        className="relative py-20 md:py-28 text-white overflow-hidden bg-[#121717] scroll-mt-14"
      >
        {/* Background photo with deep dark gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(5,12,13,0.95) 0%, rgba(5,12,13,0.75) 50%, rgba(5,12,13,0.5) 100%), url('/about/06_woman_working_factory.png')",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#69d34a] mb-4">
                <Heart size={16} /> Social Impact
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
                &ldquo;We don&apos;t just stitch bags. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0aa6b5] to-[#69d34a]">
                  We stitch families together.&rdquo;
                </span>
              </h2>
              <div className="space-y-4 text-[#d0d8d7] text-base sm:text-lg font-light leading-relaxed mb-8">
                <p>
                  At HSCVPL, business growth goes hand in hand with social impact. Nearly <strong>60% of our total workforce comprises women</strong>, reflecting our deep commitment to women&apos;s empowerment and financial independence.
                </p>
                <p>
                  Through formal employment and work-from-home opportunities in regions such as <strong>Champaran</strong>, we enable women to earn sustainable monthly incomes often exceeding <strong>₹15,000 per month</strong>, allowing them to support their families while maintaining work-life balance.
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid sm:grid-cols-2 gap-4 border-t border-white/20 pt-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0aa6b5] block mb-1">
                    Creating
                  </span>
                  <p className="text-base font-bold text-white">Sustainable Livelihoods</p>
                  <p className="text-xs text-white/60 mt-1">Financial independence for women</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#69d34a] block mb-1">
                    Empowering
                  </span>
                  <p className="text-base font-bold text-white">Grassroots Communities</p>
                  <p className="text-xs text-white/60 mt-1">Local economic revitalization</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#69d34a] block mb-1">
                    Supporting
                  </span>
                  <p className="text-base font-bold text-white">Family Welfare</p>
                  <p className="text-xs text-white/60 mt-1">Education & healthcare stability</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0aa6b5] block mb-1">
                    Carrying
                  </span>
                  <p className="text-base font-bold text-white">Dreams Forward</p>
                  <p className="text-xs text-white/60 mt-1">Building an equitable future</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-[420px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
                <img
                  src="/about/06_woman_working_factory.png"
                  alt="Women working at HSCVPL factory"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partnership Philosophy ───────────────────────────────────────── */}
      <section id="partners" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 scroll-mt-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0aa6b5] block mb-3">
            Partnership Philosophy
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] text-[#172022] leading-tight mb-4">
            Built on trust. Driven by growth.
          </h2>
          <p className="text-base text-[#667174] leading-relaxed">
            We collaborate with partners who share our commitment to quality, reliability and long-term value creation. Whether working with distributors, corporate clients, government organizations or retail partners, we believe in relationships where value flows both ways.
          </p>
        </div>

        {/* Partner Logos Frame */}
        <div className="bg-white border border-[#dfe6e4] rounded-2xl p-6 sm:p-10 shadow-lg max-w-5xl mx-auto">
          <img
            src="/about/partner_logos.png"
            alt="HSCVPL Brand & Retail Partners: Amazon, Flipkart, Myntra, Ajio, Reliance, D-Mart, Blinkit, Bata, FirstCry and more"
            className="w-full h-auto object-contain"
          />
          <p className="text-xs text-[#667174] text-center mt-6 pt-4 border-t border-[#dfe6e4]">
            Selected partner and retail logos reproduced from the official HSCVPL corporate profile.
          </p>
        </div>
      </section>

      {/* ─── Corporate PDF & Gifting Showcase ─────────────────────────────── */}
      <section className="py-14 bg-[#f4f7f6] border-y border-[#dfe6e4]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white border border-[#dfe6e4] p-6 sm:p-8 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-xs">
                <FileText size={28} />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#172022]">
                  HSCVPL Official Company Profile (2026)
                </h4>
                <p className="text-xs sm:text-sm text-[#667174] mt-0.5">
                  Comprehensive document covering infrastructure, CSR, leadership, and partner networks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowPdfModal(true)}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#101617] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <ExternalLink size={14} /> Preview PDF
              </button>
              <a
                href={pdfUrl}
                download="HSCVPL_Profile_2026.pdf"
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0aa6b5] hover:bg-[#0895a3] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ────────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative py-24 md:py-32 text-white overflow-hidden bg-[#111] scroll-mt-14"
      >
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-85"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(7,12,13,0.92) 0%, rgba(7,12,13,0.72) 100%), url('/about/final_cta_reference.jpg')",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#69d34a] block mb-4">
              Highspirit
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-[-0.05em] leading-[0.92] mb-6">
              LET’S BUILD THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0aa6b5] via-[#26B3FF] to-[#69d34a]">
                FUTURE TOGETHER.
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#d0d7d6] font-light leading-relaxed mb-8">
              We welcome opportunities to collaborate with corporate partners and brands. With strong manufacturing capabilities, reliable supply, and trusted partnership, High Spirit Commercial Ventures Pvt. Ltd. is ready to be your long-term business partner.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0aa6b5] hover:bg-[#0895a3] text-white text-xs font-black uppercase tracking-[0.16em] transition-colors shadow-xl"
              >
                Connect With Us <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/40 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer"
              >
                <FileText size={15} /> Company Profile
              </button>
            </div>
          </div>

          {/* Corporate Office Info */}
          <div className="mt-16 pt-10 border-t border-white/15 grid md:grid-cols-2 gap-6 items-center">
            <div className="flex items-start gap-3 text-sm text-white/80 font-light">
              <MapPin size={18} className="text-[#0aa6b5] shrink-0 mt-1" />
              <span>
                <strong>Corporate HQ:</strong> Universal Majestic Building, Ghatkopar-Mankhurd Link Road, Near RBK Kanakiya School, Chembur West, Mumbai 400043.
              </span>
            </div>

            <div className="flex items-center justify-start md:justify-end gap-4">
              <a
                href="https://in.linkedin.com/company/highspirit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
              >
                <Linkedin size={14} /> LinkedIn
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
              >
                <Mail size={14} /> Contact Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive PDF Modal Viewer ────────────────────────────────── */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 md:p-8">
          <div className="bg-[#101718] text-white w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/20">
            <div className="p-4 bg-[#101718] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-[#0aa6b5]" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                  HSCVPL Official Profile 2026
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={pdfUrl}
                  download="HSCVPL_Profile_2026.pdf"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0aa6b5] text-white text-xs font-bold rounded-lg hover:bg-[#0895a3] transition-colors"
                >
                  <Download size={13} /> Download
                </a>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-[#525659]">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                title="HSCVPL PDF Modal"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
