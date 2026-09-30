'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Sparkles,
  Building2,
  Briefcase
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, changeUserPassword, users } = useAppStore();

  const [activeTab, setActiveTab] = useState<'signin' | 'changepass'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Change Password Form State
  const [changeEmail, setChangeEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Quick Demo profile filler
  const handleQuickFill = (profileEmail: string) => {
    setEmail(profileEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = login(email, password);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (newPassword !== confirmPassword) {
      setChangeError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setChangeError('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = changeUserPassword(changeEmail, newPassword);
      if (!res.success) {
        setChangeError(res.message);
        setIsChangingPass(false);
        return;
      }

      setChangeSuccess('Password changed successfully! You can now log in with your new password.');
      setIsChangingPass(false);

      // Pre-fill sign-in form with the new credentials and switch tab
      setEmail(changeEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setActiveTab('signin');
        setSuccessMessage('Password updated! Click "Clock In & Sign In" to proceed.');
      }, 1200);
    } catch {
      setChangeError('Could not update password. Please verify your company email.');
      setIsChangingPass(false);
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
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[#0D52F8] text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase size={14} />
              <span>Staff Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('changepass');
                setChangeError('');
                setChangeSuccess('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'changepass'
                  ? 'bg-[#0D52F8] text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound size={14} />
              <span>Change Password</span>
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
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
                  <span>Provided Company Email *</span>
                  <span className="text-[10px] text-blue-400 font-mono font-medium">@modewebhost.com.ng / @modedigital.ng</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@modewebhost.com.ng or chioma@modedigital.ng"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
                  <label>Staff Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setChangeEmail(email);
                      setActiveTab('changepass');
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-normal cursor-pointer"
                  >
                    Change / Reset?
                  </button>
                </div>
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

              {/* Quick Profile Selection (Demo & Testing) */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 text-center">
                  Quick Staff Login (Provided Accounts)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {users.slice(0, 6).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickFill(u.email)}
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800/70 text-left transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-slate-200 truncate">{u.full_name}</div>
                      <div className="text-[10px] text-blue-400 capitalize truncate">{u.role.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'changepass' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs leading-relaxed">
                Staff members can reset or update their password here using their company email address.
              </div>

              {changeError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>{changeSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Company Email Address *</span>
                  <span className="text-[10px] text-blue-400 font-mono font-medium">@modewebhost.com.ng / @modedigital.ng</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={changeEmail}
                    onChange={(e) => setChangeEmail(e.target.value)}
                    placeholder="e.g. admin@modewebhost.com.ng or yourname@modedigital.ng"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password (Min 6 Characters) *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="w-1/3 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-2/3 py-2.5 bg-[#0D52F8] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isChangingPass ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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
