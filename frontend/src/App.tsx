import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/ui/Toast';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { JuniorPage } from './pages/JuniorPage';
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);
  return null;
};

function AppContent() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative">
        <Header onSearchOpen={() => setSearchOpen(true)} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/junior" element={<JuniorPage />} />
            <Route path="/premium" element={<PremiumCollection />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
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
        <Footer />
      </div>
      <CartDrawer />
      <AuthModal />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileBottomNav onSearchOpen={() => setSearchOpen(true)} />
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
