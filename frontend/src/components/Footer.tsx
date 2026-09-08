import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const PinterestIcon = ({ size = 15, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

// Social handles — each keeps its recognizable icon alongside the platform name.
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3', Icon: Instagram },
  { label: 'Facebook',  href: 'https://www.facebook.com/share/16nwvio56J/?mibextid=wwXIfr',      Icon: Facebook },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/hscvpl',                         Icon: Linkedin },
  { label: 'Pinterest', href: 'https://in.pinterest.com/PriorityBagsOnline/',                     Icon: PinterestIcon },
  { label: 'YouTube',   href: 'https://youtube.com/@prioritybags?si=MvAj7X6_M2L_-ago',            Icon: Youtube },
];

// Marketplaces where Priority Bags products are available ("All Ecom homepages").
const MARKETPLACES = [
  { label: 'Amazon',   href: 'https://www.amazon.in/stores/page/4A4ABBE6-8F05-4B5B-9009-2E847AC3EDC0?ingress=0&visitId=aa56f99d-d371-4740-aecc-19c6fb832f6d&ref_=ast_bln' },
  { label: 'Flipkart', href: 'https://www.flipkart.com/store/priority' },
  { label: 'Myntra',   href: 'https://www.myntra.com/priority' },
  { label: 'Ajio',     href: 'https://www.ajio.com/b/priority' },
];

const SocialHandles = () => (
  <ul className="space-y-3">
    {SOCIALS.map(({ label, href, Icon }) => (
      <li key={label}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider transition-opacity hover:opacity-70"
        >
          <Icon size={15} aria-hidden="true" />
          <span>{label}</span>
        </a>
      </li>
    ))}
  </ul>
);

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 md:border-0">
      {/* Mobile: collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-between py-4 text-white font-bold uppercase text-[12px] tracking-[0.2em]"
      >
        {title}
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80 pb-4' : 'max-h-0'}`}>
        {children}
      </div>

      {/* Desktop: always visible */}
      <h4 className="hidden md:block text-white font-bold mb-6 uppercase text-[13px] tracking-[0.18em]">{title}</h4>
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  );
};

export const Footer = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPremium = location.pathname.includes('/premium') || location.pathname.includes('/traworld') || queryParams.get('theme') === 'premium';
  const isJunior = location.pathname.startsWith('/junior') || queryParams.get('theme') === 'junior';

  const isDreamy = location.pathname === '/junior/dreamy';
  const isPower = location.pathname === '/junior/power';

  const logoSrc = isJunior
    ? '/junior/junior logo.png'
    : (isPremium ? '/Traworld/nav bar logo.png' : '/logo.png');

  // Quiet palette: the main footer was a second full-bleed cyan slab. Ink lets
  // the page end quietly instead of shouting one last time. Junior keeps its
  // colours; Premium keeps its black.
  const footerBg = isPremium
    ? 'premium-bg-black border-t border-white/5'
    : isJunior
    ? ''
    : 'bg-ink border-t border-white/5';
  const footerStyle = isDreamy
    ? { backgroundColor: '#A368FB', color: '#FFFFFF' }
    : isPower
    ? { backgroundColor: '#3E92E6', color: '#FFFFFF' }
    : isJunior
    ? { backgroundColor: '#5652bc', color: '#FFFFFF' }
    : {};

  return (
    <footer className={`${footerBg} ${isPremium ? 'text-gray-300' : '[&_*]:!text-white [&_a:hover]:!opacity-70 [&_button]:!text-white'} py-10 md:py-14 pb-28 lg:pb-24 text-sm font-outfit transition-colors duration-500`} style={footerStyle}>
      <div className="max-w-[1720px] mx-auto px-5 md:px-10">
        {/* Priority Brand Logo */}
        <div className="mb-8 md:mb-10 text-left">
          <Link to="/" className="inline-block">
            <img
              src={logoSrc}
              alt="Priority Bags"
              className={`${isJunior ? 'h-8 md:h-9' : 'h-8 md:h-9'} w-auto ${isJunior ? '' : 'brightness-0 invert'}`}
            />
          </Link>
        </div>

        {/* 4-column footer layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:divide-x md:divide-white/15 gap-2 md:gap-0">
          {/* Column 1: Company */}
          <div className="md:pr-10 lg:pr-14">
            <FooterSection title="Company">
              <ul className="space-y-3">
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to="/careers">Careers</Link></li>
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/account') : '/login'}>Account</Link></li>
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to="/about">About Us</Link></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:px-10 lg:px-14">
            <FooterSection title="Quick Links">
              <ul className="space-y-3">
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to="/backpacks">Backpacks</Link></li>
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to="/luggage">Luggage</Link></li>
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to="/accessories">Accessories</Link></li>
                <li><Link className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" to="/junior">Priority Junior</Link></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 3: Follow Us */}
          <div className="md:px-10 lg:px-14">
            <FooterSection title="Follow Us">
              <SocialHandles />
            </FooterSection>
          </div>

          {/* Column 4: Ecommerce */}
          <div className="md:pl-10 lg:pl-14">
            <FooterSection title="Ecommerce">
              <ul className="space-y-3">
                {MARKETPLACES.map((marketplace) => (
                  <li key={marketplace.label}>
                    <a
                      className="hover:text-white transition-colors text-xs font-medium uppercase tracking-wider"
                      href={marketplace.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {marketplace.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1720px] mx-auto px-5 md:px-10 mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
        <p className="text-[9px] md:text-[10px] text-gray-500 font-semibold uppercase tracking-widest text-center sm:text-left">&copy; {new Date().getFullYear()} High Spirit Commercial Ventures Pvt. Ltd. All Rights Reserved.</p>
        <p className="text-[9px] md:text-[10px] text-gray-500 font-semibold uppercase tracking-widest text-center sm:text-right">Designed &amp; Developed by Himanshu Thakur</p>
      </div>
    </footer>
  );
};

