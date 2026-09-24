import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, ChevronDown, Menu, X, Heart, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { BrandToggle } from './BrandToggle';

type HighlightVariant = 'premium' | 'junior';

// Pill styles per highlighted nav item. Written out in full so Tailwind's
// scanner can see the class names (it can't resolve interpolated strings).
const PILL_CLASS: Record<HighlightVariant, string> = {
  premium: 'bg-black shadow-black/30 hover:bg-[#1f1f1f]',
  junior: 'bg-[#F69245] shadow-[#F69245]/30 hover:bg-[#e07d30]',
};

interface NavItemProps {
  key?: React.Key;
  title: string;
  to: string;
  items?: { label: string; slug: string }[];
  /** Renders the item as a filled accent pill so it stands out from the rest. */
  highlight?: HighlightVariant;
}

const NavItem = ({ title, to, items, highlight }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isPremiumTheme = location.pathname === '/premium' || new URLSearchParams(location.search).get('theme') === 'premium';

  const getThemeTo = (path: string) => {
    if (!isPremiumTheme) return path;
    if (path === '/junior' || path === '/premium' || path === '/') return path;
    return `${path}?theme=premium`;
  };

  return (
    <li className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {highlight ? (
        <Link
          className="h-16 flex items-center px-2.5 text-[13px] font-outfit uppercase"
          to={getThemeTo(to)}
        >
          <span className={`inline-flex items-center gap-1.5 text-white font-bold tracking-[0.16em] px-3.5 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:shadow-md ${PILL_CLASS[highlight]}`}>
            {title}
            {items && <ChevronDown size={12} className={`opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
          </span>
        </Link>
      ) : (
        <Link
          className="h-16 flex items-center gap-1.5 px-4 text-[13px] font-medium font-outfit tracking-[0.18em] transition-colors duration-300 relative border-b border-transparent hover:border-current uppercase"
          to={getThemeTo(to)}
        >
          {title}
          {items && <ChevronDown size={12} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
        </Link>
      )}

      <AnimatePresence>
        {isOpen && items && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[90%] left-0 w-max min-w-[240px] max-w-[90vw] bg-white dark:bg-[#111] shadow-lg shadow-black/5 z-50 rounded-sm overflow-hidden border border-line dark:border-white/5 p-2"
          >
            {items.map((item) => (
              <Link
                key={item.slug}
                to={getThemeTo(`/${item.slug}`)}
                className="block px-5 py-3 text-[14px] font-medium font-outfit tracking-[0.14em] text-graphite dark:text-gray-300 hover:text-marine dark:hover:text-white hover:bg-bone dark:hover:bg-white/5 rounded-sm transition-colors duration-300 uppercase"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export const Header = ({ onSearchOpen }: { onSearchOpen: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navData = [
    {
      title: 'BACKPACKS',
      to: '/backpacks',
      items: [
        { label: 'College Backpacks', slug: 'college-backpacks' },
        { label: 'Laptop Backpacks', slug: 'laptop-backpacks' },
        { label: 'Trekking Backpacks', slug: 'trekking-backpacks' },
      ]
    },
    {
      title: 'TRAVEL',
      to: '/travel',
      items: [
        { label: 'Luggage', slug: 'luggage' },
        { label: 'Duffle', slug: 'duffle' },
      ]
    },
    {
      title: 'ACCESSORIES',
      to: '/accessories',
      items: [
        { label: 'Pouch', slug: 'pouch' },
        { label: 'Lunch Bag', slug: 'lunch-bag' },
        { label: 'Daypack', slug: 'daypack' },
        { label: 'Tote Bag', slug: 'tote-bag' },
      ]
    },
    { title: 'ABOUT US', to: '/about' },
    { title: 'JUNIOR', to: '/junior', highlight: 'junior' },
  ];

  const premiumNavData = [
    { title: 'HOME', to: '/premium' },
    {
      title: 'COLLECTION',
      to: '/premium',
      items: [
        { label: 'Luggage', slug: 'luggage' },
        { label: 'Backpack', slug: 'backpacks' },
        { label: 'Duffle', slug: 'duffle' },
      ],
    },
    { title: 'ABOUT US', to: '/about' },
  ];

  const queryParams = new URLSearchParams(location.search);
  const isJunior = location.pathname.startsWith('/junior') || queryParams.get('theme') === 'junior';
  const isPremiumTheme = !isJunior && (location.pathname.includes('/premium') || location.pathname.includes('/traworld') || queryParams.get('theme') === 'premium');
  const isDarkMode = isPremiumTheme;
  const activeNavData = isPremiumTheme ? premiumNavData : navData;

  const homeHref = isPremiumTheme ? '/premium' : (isJunior ? '/junior' : '/');
  const logoSrc = isJunior
    ? '/junior/junior logo.png'
    : (isPremiumTheme ? '/Traworld/nav bar logo.png' : '/logo.png');

  const shouldBeBlackNav = isPremiumTheme;

  // The main catalogue nav is light (bone) so the Premium collection's black
  // still reads as a step up — that hierarchy is the whole point of Premium, and
  // a dark nav everywhere flattened it.
  const isLightNav = !shouldBeBlackNav && !isJunior;

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 ${shouldBeBlackNav
          ? 'premium-bg-black border-b border-white/10'
          : isJunior
            ? 'bg-junior-orange shadow-xl border-b border-white/10'
            : `bg-bone/90 backdrop-blur-md border-b ${isScrolled ? 'border-line' : 'border-transparent'}`
        }`}
      style={{ color: isLightNav ? '#0F1417' : 'white' }}
    >
      <div className="max-w-[1720px] mx-auto px-4 md:px-8 h-full flex justify-between items-center relative">

        {/* Desktop Brand Switcher (Left) */}
        <div className="hidden lg:flex items-center lg:flex-1">
          {isJunior ? (
            <Link to={homeHref} className="flex items-center">
              <img
                src={logoSrc}
                alt="Priority Junior"
                className="w-[100px] sm:w-[120px] h-auto transition-all duration-300"
              />
            </Link>
          ) : (
            <BrandToggle />
          )}
        </div>

        {/* Mobile Navbar: BrandToggle centered, Menu button on right */}
        <div className="flex lg:hidden items-center justify-between w-full relative">
          {isJunior ? (
            <>
              <Link to={homeHref} className="flex items-center">
                <img
                  src={logoSrc}
                  alt="Priority Junior"
                  className="w-[95px] sm:w-[110px] h-auto transition-all duration-300"
                />
              </Link>
              <button className="p-1.5" style={{ color: 'currentColor' }} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            <>
              <div className="w-full flex items-center justify-center">
                <BrandToggle size="sm" />
              </div>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5"
                style={{ color: 'currentColor' }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>

        {/* Desktop Navigation (Centered) */}
        <nav className="hidden lg:flex items-center">
          <ul className="flex items-center">
            {activeNavData.map((nav) => <NavItem key={nav.title} title={nav.title} to={nav.to} items={nav.items} highlight={(nav as { highlight?: HighlightVariant }).highlight} />)}
          </ul>
        </nav>

        {/* Desktop Action Icons */}
        <div className="hidden lg:flex flex-1 items-center justify-end font-outfit gap-3 xl:gap-4">
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-ink/[0.06]"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-ink/[0.06] ${location.pathname === '/wishlist' ? 'bg-ink/[0.08]' : ''}`}
              aria-label="Wishlist"
            >
              <Heart size={20} fill={location.pathname === '/wishlist' ? 'currentColor' : 'none'} />
            </Link>

            {/* Account / User */}
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' || user?.role === 'hr' ? '/admin' : '/account'}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-ink/[0.06]"
                aria-label="Account"
              >
                <User size={20} className="text-current" />
              </Link>
            ) : (
              <Link
                to="/login"
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-ink/[0.06] ${location.pathname === '/login' ? 'bg-white/20' : ''}`}
                aria-label="Account"
              >
                <User size={20} />
              </Link>
            )}

            {/* Logout */}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-ink/[0.06] active:scale-95"
                title="Logout"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

    </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[9999] bg-white text-black flex flex-col font-outfit"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              {isJunior ? (
                <img src={logoSrc} alt="Priority Junior" className="w-[100px] h-auto" />
              ) : (
                <BrandToggle size="sm" />
              )}
              <button onClick={() => setIsMenuOpen(false)} className="p-2.5 border border-gray-200 rounded-full text-gray-700" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable nav area */}
            <nav className="flex-1 overflow-y-auto px-5 py-3">
              {activeNavData.map((nav) => (
                <div key={nav.title} className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <Link
                      to={nav.to}
                      className="flex-1 py-4 text-[15px] font-bold uppercase tracking-[0.12em] text-black"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {'highlight' in nav && nav.highlight ? (
                        <span className={`inline-block text-white px-3 py-1 rounded-full text-[13px] tracking-[0.12em] ${PILL_CLASS[nav.highlight as HighlightVariant]}`}>
                          {nav.title}
                        </span>
                      ) : (
                        nav.title
                      )}
                    </Link>
                    {nav.items && (
                      <button
                        onClick={() => setOpenAccordion(openAccordion === nav.title ? null : nav.title)}
                        className="p-2 text-gray-400"
                        aria-label={`${openAccordion === nav.title ? 'Collapse' : 'Expand'} ${nav.title} menu`}
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${openAccordion === nav.title ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {nav.items && openAccordion === nav.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pb-3 flex flex-col gap-0.5 bg-gray-50 rounded-xl mb-2">
                          {nav.items.map(item => (
                            <Link
                              key={item.slug}
                              to={isPremiumTheme ? `/${item.slug}?theme=premium` : `/${item.slug}`}
                              className="py-3 text-[13px] font-semibold uppercase tracking-widest text-gray-500 hover:text-priority-blue border-b border-gray-100 last:border-0 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="px-5 pt-4 pb-8 border-t border-gray-100 space-y-3 shrink-0">
              {isAuthenticated ? (
                <>
                  <Link to={user?.role === 'admin' || user?.role === 'hr' ? "/admin" : "/account"} className="w-full bg-priority-blue text-white py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest text-center block" onClick={() => setIsMenuOpen(false)}>
                    {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'hr' ? 'HR Portal' : 'My Account'}
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full bg-gray-100 text-black py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest text-center block">Logout</button>
                </>
              ) : (
                <Link to="/login" className="w-full bg-priority-blue text-white py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest text-center block" onClick={() => setIsMenuOpen(false)}>Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
