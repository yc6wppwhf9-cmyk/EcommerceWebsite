import React from 'react';
import { Download, ExternalLink, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const AboutUs = () => {
  const pdfUrl = '/HSCVPL_Profile_2026.pdf';

  return (
    <main className="font-outfit bg-[#1A1A1A] min-h-screen flex flex-col">
      <SEO
        title="About Us — High Spirit Commercial Ventures (HSCVPL) Corporate Profile"
        description="View the official corporate profile of High Spirit Commercial Ventures Pvt. Ltd. (HSCVPL) and Priority Bags."
        url="https://prioritybags.in/about"
      />

      {/* ─── Top Action Bar ──────────────────────────────────────────────── */}
      <header className="bg-ink text-white px-4 md:px-8 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 z-20 sticky top-16">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-white/70 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#26B3FF]/20 text-[#26B3FF] flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-white">
                High Spirit Commercial Ventures Pvt. Ltd.
              </h1>
              <p className="text-[11px] text-white/60">Official Corporate Profile · 2026</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-medium uppercase tracking-wider border border-white/20 transition-colors"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Open in</span> New Tab
          </a>
          <a
            href={pdfUrl}
            download="HSCVPL_Profile_2026.pdf"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-[#26B3FF] hover:bg-[#1fa0e6] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
          >
            <Download size={14} />
            Download PDF
          </a>
        </div>
      </header>

      {/* ─── Fullscreen Embedded PDF Viewer ──────────────────────────────── */}
      <div className="flex-1 w-full bg-[#525659] relative min-h-[calc(100vh-140px)] flex flex-col">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title="HSCVPL Corporate Profile"
          className="w-full flex-1 min-h-[calc(100vh-140px)] border-0"
        />

        {/* Mobile helper message if browser blocks inline PDF iframe */}
        <div className="md:hidden bg-ink/90 text-white/80 p-3 text-center text-xs border-t border-white/10">
          Viewing on mobile?{' '}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#26B3FF] font-semibold underline underline-offset-2 ml-1"
          >
            Tap here to open full PDF
          </a>
        </div>
      </div>
    </main>
  );
};
