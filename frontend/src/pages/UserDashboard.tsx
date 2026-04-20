import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Heart, MapPin, User, LogOut, ChevronRight, Lock, Mail, Phone, Loader2, X, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatPrice } from '../constants/products';

const tabExit = { opacity: 0, y: -8 };
const tabEnter = { opacity: 0, y: 10 };
const tabVisible = { opacity: 1, y: 0 };

export const UserDashboard = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');

  // Password change
  const [passForm, setPassForm] = useState({ current: '', new: '' });
  const [showPassForm, setShowPassForm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    setOrdersLoading(true);
    api.getOrders()
      .then((res) => setOrders(res.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [activeTab]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);
    try {
      await api.changePassword({ currentPassword: passForm.current, newPassword: passForm.new });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassForm({ current: '', new: '' });
      setTimeout(() => setShowPassForm(false), 2000);
    } catch (err: any) {
      setPassMsg({ type: 'err', text: err.message || 'Change failed' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleCancelPass = () => {
    setShowPassForm(false);
    setPassForm({ current: '', new: '' });
    setPassMsg(null);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '2024';

  const navItems = [
    { id: 'settings', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
        <Loader2 className="w-8 h-8 text-priority-blue animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-20 bg-[var(--color-bg-main)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">

            {/* Mobile */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-10 h-10 rounded-full bg-priority-blue text-white flex items-center justify-center text-lg font-black font-outfit shadow-xl shrink-0">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-base font-black font-outfit text-[var(--color-text-main)]">{user.name?.split(' ')[0]}</h1>
                  <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Member since {memberSince}</p>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black font-outfit tracking-widest uppercase whitespace-nowrap shrink-0 transition-all ${
                      activeTab === item.id
                        ? 'bg-priority-blue text-white shadow-md'
                        : 'text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border-main)]'
                    }`}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black font-outfit tracking-widest uppercase whitespace-nowrap shrink-0 text-red-500 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] transition-all"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden lg:block lg:sticky lg:top-24 space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="w-16 h-16 rounded-full bg-priority-blue text-white flex items-center justify-center text-2xl font-black font-outfit shadow-xl">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black font-outfit text-[var(--color-text-main)]">{user.name?.split(' ')[0]}</h1>
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">Member since {memberSince}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black font-outfit tracking-widest uppercase transition-all ${
                      activeTab === item.id
                        ? 'bg-priority-blue text-white shadow-xl shadow-priority-blue/20'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black font-outfit tracking-widest uppercase text-red-500 hover:bg-red-50 transition-all mt-4"
                >
                  <LogOut size={18} /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* Orders */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={tabEnter}
                  animate={tabVisible}
                  exit={tabExit}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <h3 className="text-xl md:text-2xl font-black font-outfit text-[var(--color-text-main)] mb-6 md:mb-8 uppercase tracking-tighter">Order History</h3>

                    {ordersLoading ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-priority-blue animate-spin" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-text-muted)]">
                        <ShoppingBag size={40} className="opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No orders yet</p>
                        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-priority-blue border-b border-priority-blue">Start Shopping</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-8 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] gap-4 sm:gap-6 hover:border-priority-blue/30 transition-all group">
                            <div className="flex items-center gap-4 sm:gap-6">
                              <div className="w-16 h-20 sm:w-20 sm:h-24 bg-[var(--color-bg-card)] rounded-2xl flex items-center justify-center border border-[var(--color-border-main)] p-2 shrink-0">
                                <Package className="text-priority-blue opacity-40" size={28} />
                              </div>
                              <div>
                                <p className="text-sm sm:text-base font-black font-outfit text-[var(--color-text-main)] mb-1 uppercase">
                                  {order.items?.length ?? 0} Item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-1">
                                  <span className="bg-priority-blue/10 text-priority-blue text-[9px] font-black uppercase px-3 py-1 rounded-full capitalize">{order.status ?? 'Processing'}</span>
                                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">#{order.id?.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                  {formatPrice(order.total ?? 0)} • {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-priority-blue group-hover:gap-4 transition-all self-start sm:self-auto"
                            >
                              View Details <ChevronRight size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={tabEnter}
                  animate={tabVisible}
                  exit={tabExit}
                  className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]"
                >
                  <h3 className="text-xl md:text-2xl font-black font-outfit text-[var(--color-text-main)] mb-6 md:mb-8 uppercase tracking-tighter">
                    Wishlist {wishlist.length > 0 && <span className="text-priority-blue">({wishlist.length})</span>}
                  </h3>

                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-text-muted)]">
                      <Heart size={40} className="opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">Your wishlist is empty</p>
                      <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-priority-blue border-b border-priority-blue">Browse Products</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {wishlist.map((product) => (
                        <div key={product.id} className="flex gap-4 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] hover:border-priority-blue/30 transition-all group">
                          <Link to={`/product/${product.slug || product.id}`} className="w-20 h-20 bg-[var(--color-bg-card)] rounded-xl flex items-center justify-center border border-[var(--color-border-main)] p-2 shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link to={`/product/${product.slug || product.id}`} className="text-xs font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight line-clamp-2 hover:text-priority-blue transition-colors">
                                {product.name}
                              </Link>
                              <p className="text-[10px] font-black text-priority-blue mt-1">{formatPrice(product.price)}</p>
                            </div>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors w-fit mt-2"
                            >
                              <X size={10} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Profile / Settings */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={tabEnter}
                  animate={tabVisible}
                  exit={tabExit}
                  className="space-y-6 md:space-y-8"
                >
                  {/* Profile */}
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <div className="w-10 h-10 bg-priority-blue text-white rounded-xl flex items-center justify-center shrink-0">
                        <User size={20} />
                      </div>
                      <h3 className="text-lg md:text-xl font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight">Profile Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Full Name</label>
                        <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                          <User size={16} className="text-[var(--color-text-muted)]" />
                          <input type="text" readOnly value={user.name} className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)]" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Email Address</label>
                        <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                          <Mail size={16} className="text-[var(--color-text-muted)]" />
                          <input type="email" readOnly value={user.email} className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)]" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-priority-blue tracking-widest">Mobile Number</label>
                        <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)]">
                          <Phone size={16} className="text-[var(--color-text-muted)]" />
                          <input
                            type="text"
                            readOnly
                            value={(user as any).phone || ''}
                            placeholder="Not provided"
                            className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex justify-between items-center mb-6 md:mb-8 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-priority-blue text-white rounded-xl flex items-center justify-center shrink-0">
                          <MapPin size={20} />
                        </div>
                        <h3 className="text-lg md:text-xl font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight">Saved Addresses</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] text-[var(--color-text-muted)] text-sm">
                      <p>Addresses are saved automatically during checkout for faster future orders.</p>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-[var(--color-bg-card)] p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock size={20} className="text-priority-blue" />
                      <h3 className="text-lg font-black font-outfit text-[var(--color-text-main)] uppercase tracking-widest">Security</h3>
                    </div>
                    {!showPassForm ? (
                      <button
                        onClick={() => setShowPassForm(true)}
                        className="w-full py-4 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-priority-blue/20"
                      >
                        Change Password
                      </button>
                    ) : (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Current Password</label>
                          <input
                            required
                            type="password"
                            value={passForm.current}
                            onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                            className="w-full p-4 bg-[var(--color-bg-main)] border border-[var(--color-border-main)] rounded-2xl outline-none text-sm font-black font-outfit"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">New Password</label>
                          <input
                            required
                            type="password"
                            minLength={8}
                            value={passForm.new}
                            onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                            className="w-full p-4 bg-[var(--color-bg-main)] border border-[var(--color-border-main)] rounded-2xl outline-none text-sm font-black font-outfit"
                          />
                          <p className="text-[9px] text-[var(--color-text-muted)] ml-1 uppercase tracking-widest">Minimum 8 characters</p>
                        </div>
                        {passMsg && (
                          <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${passMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {passMsg.text}
                          </p>
                        )}
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={passLoading}
                            className="flex-1 py-4 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {passLoading ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : 'Update Password'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelPass}
                            className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
};
