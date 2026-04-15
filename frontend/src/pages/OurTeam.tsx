import React from 'react';

const TEAM_MEMBERS = [
  { name: 'Rajesh Sharma', role: 'Managing Director', bio: 'Visionary leader with 25+ years in the textile industry.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { name: 'Anjali Gupta', role: 'Head of Design', bio: 'Master of minimalist aesthetics and functional design.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
  { name: 'Vikram Singh', role: 'Operations Head', bio: 'Optimizing logistics for a seamless global presence.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  { name: 'Priya Mehta', role: 'Marketing Director', bio: 'Championing the Priority brand across Digital horizons.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
];

export const OurTeam = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-outfit font-black uppercase tracking-tighter mb-4">The Minds Behind Priority</h1>
          <p className="text-gray-500 max-w-xl mx-auto uppercase text-[10px] font-bold tracking-[0.3em]">Our Leadership Team</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.name} className="group">
              <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square grayscale group-hover:grayscale-0 transition-all duration-500">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-priority-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">{member.name}</h3>
              <p className="text-priority-blue text-[10px] font-bold uppercase tracking-widest mb-3">{member.role}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
