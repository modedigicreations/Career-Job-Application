import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { users, setCurrentUser, setAuthenticated } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());

      if (!user) {
        setError('No account found with that email. Use one of the demo accounts below.');
        setLoading(false);
        return;
      }

      if (!user.isActive) {
        setError('This account has been deactivated. Contact an administrator.');
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setAuthenticated(true);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white text-2xl font-bold mb-4 shadow-lg shadow-brand-500/30">
            M
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MODE CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="input"
                placeholder="you@modedigital.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Sign In
                </span>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 card p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Demo Accounts (any password with 6+ chars):</p>
          <div className="space-y-1">
            {users.filter((u) => u.isActive).slice(0, 3).map((u) => (
              <button
                key={u.id}
                onClick={() => { setEmail(u.email); setPassword('password'); }}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-700">{u.email}</span>
                <span className="badge bg-brand-100 text-brand-700 capitalize">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} MODE Digital Creations. All rights reserved.
        </p>
      </div>
    </div>
  );
}
