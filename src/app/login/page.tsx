'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Authentication successful! Starting your daily shift...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C15] flex flex-col justify-center items-center px-4 py-8 sm:px-6 relative overflow-hidden">
      {/* Background Glows & Accent Graphics */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-200">MODE Operations Suite</span>
            <span className="text-blue-400 font-mono font-bold text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              v2.0
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Staff Portal &amp; Shift Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Authorized MODE Digital staff access. Daily shifts are automatically tracked upon sign-in to compute work hours and compensation.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0B1324]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 text-slate-200">
          <form onSubmit={handleSignIn} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Company Email *</span>
                <span className="text-[10px] text-blue-400 font-mono font-medium">@modedigitalcreations.ng / @modewebhost.com.ng only</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. info@modedigitalcreations.ng"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Staff Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span>Keep session active</span>
              </label>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <Clock size={12} />
                <span>Shift Timer Ready</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0D52F8] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying Credentials &amp; Clocking In...</span>
                </>
              ) : (
                <>
                  <span>Clock In &amp; Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
            <ShieldCheck size={14} className="shrink-0 mt-0.5 text-slate-600" />
            <span>
              Forgot your password, or don&apos;t have an account yet? Contact your administrator —
              staff accounts and password resets are set up from inside the Operations Suite, not from this screen.
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} MODE Digital Creations. All rights reserved.</p>
          <p className="text-slate-600">Enterprise Operations &amp; Shift Management System</p>
        </div>
      </div>
    </div>
  );
}
