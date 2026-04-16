import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
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
        setTimeout(() => navigate('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token, navigate]);

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
            <p className="text-stone-600 mb-8 leading-relaxed">
              {message}. Redirecting you to login...
            </p>
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
            <Link 
              to="/"
              className="w-full bg-stone-900 text-white font-semibold py-4 rounded-xl hover:bg-stone-800 transition-all shadow-lg text-center"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
