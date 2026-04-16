import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const res = await api.resetPassword(token, password);
      setStatus('success');
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl border border-stone-100 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">Password Reset!</h1>
          <p className="text-stone-600 mb-10 leading-relaxed font-medium">
            Your password has been successfully updated. We're taking you back to the login page now.
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 text-stone-900 font-bold hover:gap-4 transition-all"
          >
            Go to Login <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-stone-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">Set New Password</h1>
          <p className="text-stone-500 leading-relaxed">
            Please choose a strong password that you haven't used before.
          </p>
        </div>

        {status === 'error' && (
          <div className="p-5 rounded-2xl mb-8 bg-red-50 text-red-700 border border-red-100 flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
             <p className="text-sm font-bold">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 ml-1 uppercase tracking-wider">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-stone-900 focus:bg-white outline-none transition-all text-stone-900 placeholder:text-stone-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 ml-1 uppercase tracking-wider">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-stone-900 focus:bg-white outline-none transition-all text-stone-900 placeholder:text-stone-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
