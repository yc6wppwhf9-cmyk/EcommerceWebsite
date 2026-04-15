import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export const ContactUs = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-outfit font-black uppercase tracking-tighter mb-4 text-priority-dark">Get in Touch</h1>
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
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                  <input type="email" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject</label>
                <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="Inquiry about Product" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message</label>
                <textarea rows={5} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-priority-blue transition-all" placeholder="How can we help you today?"></textarea>
              </div>
              <button className="w-full bg-priority-blue text-white font-black py-4 rounded-xl hover:bg-priority-dark transition-all shadow-lg hover:shadow-priority-blue/20">
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
