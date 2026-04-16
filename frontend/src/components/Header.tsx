import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, ChevronDown, Menu, X, LogOut, LayoutDashboard, Heart, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavItemProps {
  title: string;
  to: string;
  items?: { label: string; slug: string }[];
}

const NavItem = ({ title, to, items }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <Link
        className="h-16 flex items-center gap-1.5 px-4 text-[13px] font-semibold font-outfit tracking-[0.15em] text-white hover:text-white/70 transition-all duration-300 relative border-b-4 border-transparent hover:border-white uppercase"
        to={to}
      >
        {title}
        {items && <ChevronDown size={12} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
      </Link>

      <AnimatePresence>
        {isOpen && items && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-[90%] left-0 w-max min-w-[240px] bg-white dark:bg-[#111] shadow-2xl z-50 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 p-2"
          >
            {items.map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className="block px-5 py-3 text-[11px] font-semibold font-outfit tracking-widest text-priority-blue dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all uppercase"
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
  const { itemCount, toggleCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDarkMode(dark);
  };

  const navData = [
    {
      title: 'BACKPACKS',
      to: '/backpacks',
      items: [
        { label: 'College Backpacks', slug: 'college-backpacks' },
        { label: 'School Backpacks', slug: 'school-backpacks' },
        { label: 'Office Backpacks', slug: 'office-backpacks' },
        { label: 'Trekking Backpacks', slug: 'trekking-backpacks' },
      ]
    },
    {
      title: 'TRAVEL',
      to: '/travel',
      items: [
        { label: 'Luggage', slug: 'luggage' },
        { label: 'Duffle', slug: 'duffle' },
        { label: 'Trekking', slug: 'trekking' },
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
    { title: 'JUNIOR', to: '/junior' },
    { title: 'PREMIUM', to: '/premium' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-16 ${
      isScrolled 
        ? 'bg-priority-blue/95 dark:bg-black/95 shadow-xl backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-full flex justify-between items-center text-white">

        <div className="flex-1 flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/nav bar.png"
              alt="Priority"
              className="w-[140px] h-auto"
            />
          </Link>
        </div>

        <nav className="hidden lg:block">
          <ul className="flex items-center">
            {navData.map((nav) => <NavItem key={nav.title} {...nav} />)}
          </ul>
        </nav>

        <div className="flex-1 flex items-center justify-end font-outfit">
          {/* Icon group — all same size, equal gap */}
          <div className="hidden md:flex items-center gap-1">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${location.pathname === '/wishlist' ? 'bg-white text-priority-blue' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              <Heart size={20} fill={location.pathname === '/wishlist' ? 'currentColor' : 'none'} />
            </Link>

            {/* Account / User — with theme toggle inside dropdown */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${location.pathname.startsWith('/account') || location.pathname.startsWith('/admin') ? 'bg-white border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                  <span className={`text-[11px] font-bold uppercase ${location.pathname.startsWith('/account') || location.pathname.startsWith('/admin') ? 'text-priority-blue' : 'text-white'}`}>
                    {user?.name?.charAt(0)}
                  </span>
                </button>
                <div className="absolute top-full right-0 w-56 pt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white dark:bg-[#111] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 p-2">
                    <Link to={user?.role === 'admin' ? "/admin" : "/account"} className="flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-priority-blue dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                      <LayoutDashboard size={16} /> {user?.role === 'admin' ? 'Admin Panel' : 'My Account'}
                    </Link>
                    <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <div className="my-1 border-t border-gray-100 dark:border-white/5" />
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <Link to="/login" className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${location.pathname === '/login' ? 'bg-white text-priority-blue' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <User size={20} />
                </Link>
                <div className="absolute top-full right-0 w-56 pt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white dark:bg-[#111] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 p-2">
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-priority-blue dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                      <User size={16} /> Login
                    </Link>
                    <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart */}
            <button
              onClick={() => toggleCart()}
              className={`w-10 h-10 flex items-center justify-center rounded-full relative transition-all duration-300 hover:bg-white/10 active:scale-95 ${(itemCount > 0 || location.pathname === '/checkout') ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--color-nav-bg)]">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <button className="lg:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 z-[60] bg-[var(--color-bg-main)] text-[var(--color-text-main)] overflow-y-auto font-outfit">
            <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--color-border-main)]">
              <img src="/nav bar.png" alt="Priority" className="w-[120px] h-auto dark:invert" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2.5 border border-[var(--color-border-main)] rounded-full text-[var(--color-text-main)]"><X size={20} /></button>
            </div>
            <nav className="px-5 py-6 space-y-1">
              {navData.map((nav) => (
                <div key={nav.title}>
                  <Link to={nav.to} className="block py-3.5 text-xl font-bold uppercase tracking-tight text-[var(--color-text-main)] border-b border-[var(--color-border-main)]" onClick={() => setIsMenuOpen(false)}>{nav.title}</Link>
                  {nav.items && (
                    <div className="pl-4 py-2 flex flex-col gap-1">
                      {nav.items.map(item => (
                        <Link key={item.slug} to={`/${item.slug}`} className="py-2 text-xs font-semibold uppercase text-[var(--color-text-muted)] tracking-widest" onClick={() => setIsMenuOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="px-5 pt-4 pb-8 border-t border-[var(--color-border-main)] space-y-3">
              <button onClick={toggleDarkMode} className="w-full flex items-center justify-center gap-2 border border-[var(--color-border-main)] text-[var(--color-text-muted)] py-3.5 rounded-2xl text-[11px] font-semibold uppercase tracking-widest">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              {isAuthenticated ? (
                <>
                  <Link to={user?.role === 'admin' ? "/admin" : "/account"} className="w-full bg-priority-blue text-white py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-center block" onClick={() => setIsMenuOpen(false)}>
                    {user?.role === 'admin' ? 'Admin Panel' : 'My Account'}
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full border border-red-200 text-red-500 py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-center block">Logout</button>
                </>
              ) : (
                <Link to="/login" className="w-full bg-priority-blue text-white py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-center block" onClick={() => setIsMenuOpen(false)}>Member Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
