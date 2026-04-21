import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ChatBot } from './components/ChatBot';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/ui/Toast';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { JuniorPage } from './pages/JuniorPage';
import { JuniorStylePage } from './pages/JuniorStylePage';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { PremiumCollection } from './pages/PremiumCollection';
import { LoginPage } from './pages/LoginPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { Careers } from './pages/Careers';
import { OurTeam } from './pages/OurTeam';
import { ShippingPolicy, ReturnsRefunds, PrivacyPolicy, TermsOfService } from './pages/Policies';
import { Wishlist } from './pages/Wishlist';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
  const isAdmin = location.pathname.startsWith('/admin');
  const isPremium = location.pathname.startsWith('/premium');

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative bg-[var(--color-bg-main)] text-[var(--color-text-main)] transition-colors duration-300">
        {!isAdmin && !isPremium && <Header onSearchOpen={() => setSearchOpen(true)} />}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/junior" element={<JuniorPage />} />
            <Route path="/junior/:style" element={<JuniorStylePage />} />
            <Route path="/premium" element={<PremiumCollection />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/account" element={<ProtectedRoute userOnly><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/team" element={<OurTeam />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/returns" element={<ReturnsRefunds />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* All category routes use the same component */}
            <Route path="/:category" element={<CategoryPage />} />
          </Routes>
        </div>
        {!isAdmin && !isPremium && <Footer />}
      </div>
      <CartDrawer />
      <AuthModal />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {!isAdmin && <MobileBottomNav onSearchOpen={() => setSearchOpen(true)} />}
      {!isAdmin && !isPremium && <ChatBot />}
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
