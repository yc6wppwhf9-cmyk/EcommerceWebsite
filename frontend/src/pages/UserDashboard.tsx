import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Heart, MapPin, User, Settings,
  LogOut, ChevronRight, Lock, Mail, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserDashboard = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);

  const navItems = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'App Settings', icon: Settings },
  ];

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[var(--color-bg-main)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="w-16 h-16 rounded-full bg-priority-blue text-white flex items-center justify-center text-2xl font-black font-outfit shadow-xl">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black font-outfit text-[var(--color-text-main)]">{user.name?.split(' ')[0]}</h1>
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">Member since 2024</p>
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
              {activeTab === 'orders' && (
                <motion.div 
                  key="orders" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-[var(--color-bg-card)] p-10 rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <h3 className="text-2xl font-black font-outfit text-[var(--color-text-main)] mb-8 uppercase tracking-tighter">Order History</h3>
                    <div className="space-y-4">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-[var(--color-bg-main)] rounded-[2rem] border border-[var(--color-border-main)] gap-6 hover:border-priority-blue/30 transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-24 bg-[var(--color-bg-card)] rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--color-border-main)] p-2">
                              <Package className="text-priority-blue opacity-40" size={32} />
                            </div>
                            <div>
                              <p className="text-base font-black font-outfit text-[var(--color-text-main)] mb-1 uppercase">Urban Trekker 30L</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-priority-blue/10 text-priority-blue text-[9px] font-black uppercase px-3 py-1 rounded-full">Shipped</span>
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Order #PRI-884{i}</span>
                              </div>
                            </div>
                          </div>
                          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-priority-blue group-hover:gap-4 transition-all">
                            View Details <ChevronRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div 
                  key="wishlist" 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--color-bg-card)] p-10 rounded-[2.5rem] border border-[var(--color-border-main)]"
                >
                  <h3 className="text-2xl font-black font-outfit text-[var(--color-text-main)] mb-8 uppercase tracking-tighter">Wishlist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p className="text-xs text-[var(--color-text-muted)] col-span-full">You haven't added anything to your wishlist yet.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Account Profile Section */}
                  <div className="bg-[var(--color-bg-card)] p-10 rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-priority-blue text-white rounded-xl flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <h3 className="text-xl font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight">Profile Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                          <input type="text" placeholder="+91 999 999 9999" className="bg-transparent text-sm font-black font-outfit w-full outline-none text-[var(--color-text-main)]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Addresses Section */}
                  <div className="bg-[var(--color-bg-card)] p-10 rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-priority-blue text-white rounded-xl flex items-center justify-center">
                          <MapPin size={20} />
                        </div>
                        <h3 className="text-xl font-black font-outfit text-[var(--color-text-main)] uppercase tracking-tight">Saved Addresses</h3>
                      </div>
                      <button className="text-[10px] font-black uppercase text-priority-blue border-b-2 border-priority-blue">Add New</button>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border-main)] text-[var(--color-text-muted)] text-sm">
                      <p>No addresses saved yet. Add one for faster checkout.</p>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-[var(--color-bg-card)] p-10 rounded-[2.5rem] border border-[var(--color-border-main)]">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock size={20} className="text-priority-blue" />
                      <h3 className="text-lg font-black font-outfit text-[var(--color-text-main)] uppercase">Security</h3>
                    </div>
                    <button className="w-full py-4 bg-priority-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-priority-blue/20">Change Password</button>
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
