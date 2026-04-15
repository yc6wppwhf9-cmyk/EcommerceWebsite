import React from 'react';
import { Briefcase, Send } from 'lucide-react';

const JOBS = [
  { id: 'j1', title: 'Senior Product Designer', type: 'Full-time', location: 'Mumbai HQ' },
  { id: 'j2', title: 'Content Strategist', type: 'Remote', location: 'India' },
  { id: 'j3', title: 'Operations Manager', type: 'Full-time', location: 'Mumbai (Warehouse)' },
];

export const Careers = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-outfit font-black uppercase tracking-tighter mb-4">Join the Movement</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Help us redefine travel gear for the next generation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Openings */}
          <div>
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-priority-blue" />
              Current Openings
            </h2>
            <div className="space-y-4">
              {JOBS.map((job) => (
                <div key={job.id} className="p-6 border border-gray-100 rounded-2xl flex justify-between items-center hover:shadow-lg transition-all group cursor-pointer bg-white">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-priority-blue transition-colors">{job.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{job.type} &nbsp;•&nbsp; {job.location}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-priority-blue group-hover:text-white transition-all">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-priority-dark p-8 md:p-12 rounded-3xl text-white">
            <h2 className="text-2xl font-black mb-2 uppercase">Apply Now</h2>
            <p className="text-gray-400 text-sm mb-8">Don't see a role? Send a general application.</p>
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone</label>
                  <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="+91..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Resume Link (PDF/Drive)</label>
                <input type="url" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Why Priority?</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="Tell us about yourself..."></textarea>
              </div>
              <button className="w-full bg-priority-blue text-white font-black py-4 rounded-xl hover:bg-white hover:text-priority-dark transition-all shadow-lg">
                SUBMIT APPLICATION
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
