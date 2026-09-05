import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── View states ──────────────────────────────────────────────────────────────
// 'signin' | 'signup' | 'forgot'

export default function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [view, setView]       = useState('signin');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => { setError(null); setResetSent(false); };

  // ─── Google ─────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true); reset();
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (e) { setError(friendlyError(e.code)); }
    finally { setLoading(false); }
  };

  // ─── Email submit ────────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      if (view === 'signin') {
        await signInWithEmail(email, password);
        navigate('/');
      } else {
        await signUpWithEmail(email, password);
        // After signup, verification email is auto-sent.
        // App.jsx ProtectedRoute will show verify screen.
        navigate('/');
      }
    } catch (e) { setError(friendlyError(e.code)); }
    finally { setLoading(false); }
  };

  // ─── Forgot password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address first.'); return; }
    setLoading(true); reset();
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (e) { setError(friendlyError(e.code)); }
    finally { setLoading(false); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-vault-bg flex flex-col items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-3xl font-bold text-vault-text tracking-tight">
            Time<span className="text-amber-400">Vault</span>
          </h1>
          <p className="text-sm text-vault-muted mt-1.5">
            Lock passwords. Trust the timer.
          </p>
        </div>

        {/* Card */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6">

          {/* ── FORGOT PASSWORD VIEW ─────────────────────────────────── */}
          {view === 'forgot' ? (
            <>
              <button
                onClick={() => { setView('signin'); reset(); }}
                className="flex items-center gap-1.5 text-sm text-vault-muted hover:text-vault-text transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-bold text-vault-text">Reset Password</h2>
                  <p className="text-xs text-vault-muted">We'll send a reset link to your email</p>
                </div>
              </div>

              {resetSent ? (
                /* Success state */
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-vault-text mb-1">Email sent!</h3>
                  <p className="text-sm text-vault-muted mb-4 leading-relaxed">
                    Check your inbox at <strong className="text-vault-text">{email}</strong>. Click the link to reset your password.
                  </p>
                  <p className="text-xs text-vault-muted mb-4">Didn't get it? Check spam folder.</p>
                  <button
                    onClick={() => { setView('signin'); reset(); setEmail(''); }}
                    className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-vault-muted mb-1.5">Your email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-vault-surface border border-vault-border text-sm text-vault-text placeholder:text-vault-muted outline-none focus:border-amber-500/50 transition-all"
                      autoFocus
                    />
                  </div>

                  {error && <ErrorBox msg={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Spinner />}
                    Send reset email
                  </button>
                </form>
              )}
            </>
          ) : (
            /* ── SIGN IN / SIGN UP VIEW ─────────────────────────────── */
            <>
              {/* Tab toggle */}
              <div className="flex rounded-xl bg-vault-surface border border-vault-border p-1 mb-5">
                {['signin', 'signup'].map(v => (
                  <button
                    key={v}
                    onClick={() => { setView(v); reset(); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      view === v
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-vault-muted hover:text-vault-text'
                    }`}
                  >
                    {v === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-vault-border bg-vault-surface hover:bg-vault-border text-vault-text text-sm font-medium transition-all disabled:opacity-50 mb-4"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-vault-border" />
                </div>
                <div className="relative flex justify-center text-xs text-vault-muted">
                  <span className="bg-vault-card px-3">or use email</span>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-vault-muted mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-vault-surface border border-vault-border text-sm text-vault-text placeholder:text-vault-muted outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-vault-muted">Password</label>
                    {/* Forgot password link — only on sign-in */}
                    {view === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); reset(); }}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-vault-surface border border-vault-border text-sm text-vault-text placeholder:text-vault-muted outline-none focus:border-amber-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {view === 'signup' && (
                    <p className="mt-1 text-xs text-vault-muted">Minimum 6 characters</p>
                  )}
                </div>

                {error && <ErrorBox msg={error} />}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {loading && <Spinner />}
                  {view === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              {/* Switch mode hint */}
              <p className="text-center text-xs text-vault-muted mt-4">
                {view === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setView(view === 'signin' ? 'signup' : 'signin'); reset(); }}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  {view === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-vault-muted mt-5 leading-relaxed">
          Passwords are encrypted with AES-256-GCM.<br />
          We never see your data — server-enforced time lock.
        </p>
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-500/20">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-red-300">{msg}</p>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':       'No account found with this email. Please sign up first.',
    'auth/wrong-password':       'Wrong password. Try again or use "Forgot password?"',
    'auth/invalid-credential':   'Wrong email or password. Try again or use "Forgot password?"',
    'auth/email-already-in-use': 'An account already exists with this email. Please sign in.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/too-many-requests':    'Too many attempts. Please wait a few minutes and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was closed. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/user-disabled':        'This account has been disabled.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
