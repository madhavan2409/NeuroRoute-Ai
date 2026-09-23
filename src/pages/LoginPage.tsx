import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, LogIn, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}! Logged in as ${user.role}.`, 'success');

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123456');
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(demoEmail, 'demo123456');
      showToast(`Logged in as ${user.name} (${user.role})`, 'success');
      if (user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EventHub</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500">Access campus events and manage registrations</p>
        </div>

        {/* Demo Fast-Login Box */}
        {isDemoMode && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950">
                1-Click Judge & Evaluator Fast Login
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Instantly test the platform without filling credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickFill('student@demo.com')}
                className="py-2 px-3 rounded-xl bg-white border border-indigo-200 text-indigo-950 text-xs font-bold hover:bg-indigo-600 hover:text-white transition shadow-sm text-center"
              >
                🎓 Student Account
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('organizer@demo.com')}
                className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-500 hover:text-white transition shadow-sm text-center"
              >
                🏛️ Organizer Account
              </button>
            </div>
          </div>
        )}

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@demo.com or organizer@demo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Demo mode accepts any password</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
