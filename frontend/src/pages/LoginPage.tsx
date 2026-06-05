import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, register, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/account');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await (mode === 'login'
        ? login(email, password)
        : register(name, email, password, phone || undefined));
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    }
  };

  const inputClass = 'w-full px-4 py-4 bg-white border border-gray-900/10 focus:border-gray-900 outline-none transition-colors text-[15px] placeholder:text-gray-400';

  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-12 pb-20 px-6 font-outfit">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-10">
          <Link to="/">
            <img src="/logo.png" alt="Priority" className="h-10 w-auto" />
          </Link>
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">
            {mode === 'login' ? 'Login' : 'Create account'}
          </h1>
        </header>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className={inputClass}
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className={inputClass}
              />
            </>
          )}

          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={`${inputClass} pl-12`}
              required
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
              <Mail size={18} strokeWidth={1.5} />
            </div>
          </div>

          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`${inputClass} pr-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="pt-1">
              <Link
                to={email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password'}
                className="text-[13px] text-gray-600 underline underline-offset-4 hover:text-black transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="pt-8 flex flex-col items-center gap-8">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full max-w-[160px] bg-[#111111] text-white py-4 text-sm font-black tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" /> Please wait</>
                : (mode === 'login' ? 'Sign in' : 'Create')}
            </motion.button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
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
