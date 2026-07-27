import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/ui/Toast';
import { Home } from './pages/Home';

const CategoryPage = lazy(() => import('./pages/CategoryPage').then((module) => ({ default: module.CategoryPage })));
const JuniorPage = lazy(() => import('./pages/JuniorPage').then((module) => ({ default: module.JuniorPage })));
const JuniorStylePage = lazy(() => import('./pages/JuniorStylePage').then((module) => ({ default: module.JuniorStylePage })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((module) => ({ default: module.ProductDetail })));
const PremiumCollection = lazy(() => import('./pages/PremiumCollection').then((module) => ({ default: module.PremiumCollection })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const UserDashboard = lazy(() => import('./pages/UserDashboard').then((module) => ({ default: module.UserDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const ContactUs = lazy(() => import('./pages/ContactUs').then((module) => ({ default: module.ContactUs })));
const Careers = lazy(() => import('./pages/Careers').then((module) => ({ default: module.Careers })));
const ShippingPolicy = lazy(() => import('./pages/Policies').then((module) => ({ default: module.ShippingPolicy })));
const ReturnsRefunds = lazy(() => import('./pages/Policies').then((module) => ({ default: module.ReturnsRefunds })));
const PrivacyPolicy = lazy(() => import('./pages/Policies').then((module) => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/Policies').then((module) => ({ default: module.TermsOfService })));
const ClaimWarranty = lazy(() => import('./pages/Policies').then((module) => ({ default: module.ClaimWarranty })));
const Wishlist = lazy(() => import('./pages/Wishlist').then((module) => ({ default: module.Wishlist })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SupportStatus = lazy(() => import('./pages/SupportStatus').then((module) => ({ default: module.SupportStatus })));

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }: { children: React.ReactNode; adminOnly?: boolean; userOnly?: boolean }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  if (userOnly && user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function AppContent() {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPremium = location.pathname.startsWith('/premium');
  const isPremiumTheme = isPremium || searchParams.get('theme') === 'premium';

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative bg-[var(--color-bg-main)] text-[var(--color-text-main)] transition-colors duration-300">
        {!isAdmin && !isPremium && <Header onSearchOpen={() => setSearchOpen(true)} />}
        <div className={`flex-grow ${!isAdmin && !isPremium ? 'pt-16' : ''} ${!isAdmin ? 'pb-20 lg:pb-0' : ''}`}>
          <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm font-semibold text-gray-500">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/junior" element={<JuniorPage />} />
            <Route path="/junior/:style" element={<JuniorStylePage />} />
            <Route path="/premium" element={<PremiumCollection />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/account" element={<ProtectedRoute userOnly><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/returns" element={<ReturnsRefunds />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/warranty" element={<ClaimWarranty />} />
            <Route path="/support-status" element={<SupportStatus />} />
            {/* All category routes use the same component */}
            <Route path="/:category" element={<CategoryPage />} />
          </Routes>
          </Suspense>
        </div>
        {!isAdmin && !isPremiumTheme && <Footer />}
      </div>
      <AuthModal />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {!isAdmin && <MobileBottomNav onSearchOpen={() => setSearchOpen(true)} />}
      {!isAdmin && !isPremiumTheme && <ChatBot />}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}
