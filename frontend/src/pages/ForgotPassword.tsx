import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Mail, ArrowLeft, Loader2, Send, RefreshCcw } from 'lucide-react';

export const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryEmail = new URLSearchParams(location.search).get('email') || '';

  const [email, setEmail] = useState(queryEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  const triggerReset = async (targetEmail: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.forgotPassword(targetEmail);
      setMessage({ type: 'success', text: res.message });
      setSent(true);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerReset(email);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-stone-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">Forgot Password?</h1>
          <p className="text-stone-500 leading-relaxed px-4 text-sm">
            {sent
              ? `A reset link was sent to ${email}`
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {message && (
          <div className={`p-5 rounded-2xl mb-8 flex items-start gap-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <span className="text-lg leading-none mt-1">{message.type === 'success' ? '✓' : '⚠'}</span>
            <p className="text-xs font-semibold uppercase tracking-tight leading-normal">{message.text}</p>
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <button
              onClick={() => triggerReset(email)}
              disabled={loading}
              className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCcw className="w-5 h-5" /> Resend Link</>}
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full text-[11px] font-bold text-stone-400 underline underline-offset-4 uppercase tracking-widest hover:text-stone-900 transition-colors"
            >
              Try with another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-stone-900 focus:bg-white outline-none transition-all text-stone-900 placeholder:text-stone-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Reset Link</>}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-stone-100 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
