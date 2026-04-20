import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.verifyEmail(token);
        setStatus('success');
        setMessage(res.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { navigate('/login'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResending(true);
    setResendMessage('');
    try {
      await api.forgotPassword(resendEmail);
      setResendMessage('A new verification email has been sent. Please check your inbox.');
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-stone-100 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-stone-900 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Verifying your account</h2>
            <p className="text-stone-500">Please wait while we confirm your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Email Verified!</h2>
            <p className="text-stone-600 mb-2 leading-relaxed">{message}.</p>
            <p className="text-stone-400 text-sm mb-8">Redirecting to login in {countdown}s…</p>
            <Link
              to="/login"
              className="w-full bg-stone-900 text-white font-semibold py-4 rounded-xl hover:bg-stone-800 transition-all shadow-lg text-center"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Verification Failed</h2>
            <p className="text-stone-600 mb-8 leading-relaxed">{message}</p>

            <div className="w-full border-t border-stone-100 pt-6">
              <p className="text-sm font-bold text-stone-700 mb-4">Resend verification email</p>
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-stone-50 border-2 border-transparent rounded-xl focus:border-stone-900 focus:bg-white outline-none transition-all text-stone-900 placeholder:text-stone-300 text-sm"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full bg-stone-900 text-white font-semibold py-3 rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend Email'}
                </button>
              </form>
              {resendMessage && (
                <p className="text-xs text-stone-500 mt-3">{resendMessage}</p>
              )}
            </div>

            <Link to="/" className="mt-6 text-sm text-stone-400 hover:text-stone-900 transition-colors">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
