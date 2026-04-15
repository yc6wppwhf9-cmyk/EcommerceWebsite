import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const LoginPage = () => {
  const { login, register, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/account');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = mode === 'login'
        ? await login(email, password)
        : await register(name, email, password);
      if (!success) setError('Invalid login credentials.');
    } catch {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-12 pb-20 px-6 font-outfit">
      <div className="w-full max-w-[440px]">
        {/* Logo / Image */}
        <div className="flex justify-center mb-10">
          <Link to="/">
            <img src="/Priority Logo-02.png" alt="Priority" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">
            {mode === 'login' ? 'Login' : 'Create account'}
          </h1>
        </header>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg"
            >
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="space-y-1">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-4 bg-white border border-gray-900/10 focus:border-gray-900 outline-none transition-colors text-[15px] placeholder:text-gray-400"
                required
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-900/10 focus:border-gray-900 outline-none transition-colors text-[15px] placeholder:text-gray-400"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                <Mail size={18} strokeWidth={1.5} />
              </div>
            </div>
            
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-4 bg-white border border-gray-900/10 focus:border-gray-900 outline-none transition-colors text-[15px] placeholder:text-gray-400"
              required
            />
          </div>

          <div className="pt-2">
            <button type="button" className="text-[13px] text-gray-600 underline underline-offset-4 hover:text-black transition-colors">
              Forgot your password?
            </button>
          </div>

          <div className="pt-8 flex flex-col items-center gap-8">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full max-w-[124px] bg-[#111111] text-white py-4 text-sm font-black tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : (mode === 'login' ? 'Sign in' : 'Create')}
            </motion.button>

            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[13px] text-gray-600 underline underline-offset-4 hover:text-black transition-colors"
            >
              {mode === 'login' ? 'Create account' : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
