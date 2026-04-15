import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 md:border-0">
      {/* Mobile: collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-between py-4 text-white font-semibold uppercase text-[11px] tracking-[0.2em]"
      >
        {title}
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 pb-4' : 'max-h-0'}`}>
        {children}
      </div>

      {/* Desktop: always visible */}
      <h4 className="hidden md:block text-white font-semibold mb-6 uppercase text-[10px] tracking-[0.2em]">{title}</h4>
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  );
};

export const Footer = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer className="bg-priority-dark text-gray-300 py-10 md:py-12 pb-24 lg:pb-12 text-sm font-outfit">
      <div className="container mx-auto px-5 md:px-10">
        {/* Brand — always visible */}
        <div className="mb-8 md:mb-0 md:hidden">
          <Link to="/" className="mb-4 block">
            <img src="/Priority Logo-02.png" alt="Priority Bags" className="h-8 w-auto brightness-0 invert" />
          </Link>
          <p className="text-[10px] font-semibold tracking-[0.3em] text-[#ae9efd] uppercase mb-3">The Digital Atelier</p>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Premium bags and luggage for every journey. Quality craftsmanship since 1999.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-12">
          {/* Brand — desktop */}
          <div className="hidden md:block col-span-1 break-inside-avoid">
            <Link to="/" className="mb-8 block">
              <img src="/Priority Logo-02.png" alt="Priority Bags" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-[#ae9efd] uppercase mb-4">The Digital Atelier</p>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Premium bags and luggage for every journey. Quality craftsmanship since 1999. Engineered for movement.
            </p>
          </div>

          <FooterSection title="Quick Links">
            <ul className="space-y-3">
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/backpacks">Backpacks</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/luggage">Luggage</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/accessories">Accessories</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/junior">Priority Junior</Link></li>
            </ul>
          </FooterSection>

          <FooterSection title="Company">
            <ul className="space-y-3">
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/about">About Us</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/team">Our Team</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/careers">Careers</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to={isAuthenticated ? (user?.role === 'admin' ? "/admin" : "/account") : "/login"}>Account</Link></li>
            </ul>
          </FooterSection>

          <FooterSection title="Policies">
            <ul className="space-y-3">
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/shipping">Shipping Policy</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/returns">Returns & Refunds</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/privacy">Privacy Notice</Link></li>
              <li><Link className="hover:text-white transition-colors text-xs font-medium" to="/terms">Terms of Service</Link></li>
            </ul>
          </FooterSection>

          <FooterSection title="Contact Us">
            <address className="not-italic space-y-4 text-xs font-medium">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#ae9efd]" />
                <span className="text-gray-400 leading-relaxed">High Spirit Commercial Ventures Pvt. Ltd.<br />Universal Majestic Building, Chembur West<br />Mumbai 400043</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-[#ae9efd]" />
                <a href="tel:+917400459254" className="text-gray-400 hover:text-white transition-colors">+91 74004 59254</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-[#ae9efd]" />
                <a href="mailto:info@prioritybags.in" className="text-gray-400 hover:text-white transition-colors">info@prioritybags.in</a>
              </div>
            </address>
          </FooterSection>
        </div>
      </div>

      <div className="container mx-auto px-5 md:px-10 mt-8 md:mt-16 pt-6 md:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
        <p className="text-[9px] md:text-[10px] text-gray-500 font-semibold uppercase tracking-widest text-center sm:text-left">&copy; {new Date().getFullYear()} High Spirit Commercial Ventures Pvt. Ltd.</p>
        <div className="flex items-center gap-6 md:gap-8">
          <a href="https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-[10px] font-semibold uppercase tracking-widest">Instagram</a>
          <a href="https://www.facebook.com/share/16nwvio56J/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-[10px] font-semibold uppercase tracking-widest">Facebook</a>
          <a href="https://youtube.com/@prioritybags?si=MvAj7X6_M2L_-ago" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-[10px] font-semibold uppercase tracking-widest">YouTube</a>
        </div>
      </div>
    </footer>
  );
};
