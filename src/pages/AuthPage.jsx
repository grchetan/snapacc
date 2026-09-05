import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [view, setView]         = useState('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => {
    setError(null);
    setResetSent(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    reset();
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    reset();
    try {
      if (view === 'signin') {
        await signInWithEmail(email, password);
        navigate('/');
      } else {
        await signUpWithEmail(email, password);
        navigate('/');
      }
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    reset();
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Time<span className="text-amber-400">Vault</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Zero-knowledge time-locked credential manager
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' ? (
            <>
              <button
                onClick={() => { setView('signin'); reset(); }}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">Reset Password</h2>
                  <p className="text-xs text-zinc-400">We will send a reset link to your email</p>
                </div>
              </div>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-100 mb-1">Email Sent</h3>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    Check your inbox at <span className="text-zinc-200 font-medium">{email}</span> to reset your password.
                  </p>
                  <button
                    onClick={() => { setView('signin'); reset(); setEmail(''); }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold transition-all"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 transition-colors"
                      autoFocus
                    />
                  </div>

                  {error && <ErrorBox msg={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Spinner />}
                    <span>Send Reset Email</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            /* SIGN IN / SIGN UP VIEW */
            <>
              {/* Segmented Control */}
              <div className="flex rounded-xl bg-zinc-950 border border-zinc-800 p-1 mb-5">
                {['signin', 'signup'].map(v => (
                  <button
                    key={v}
                    onClick={() => { setView(v); reset(); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      view === v
                        ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {v === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-950 text-zinc-200 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 mb-4"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] text-zinc-500 uppercase tracking-widest">
                  <span className="bg-zinc-900 px-2 font-medium">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Password
                    </label>
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
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title={showPwd ? 'Hide' : 'Show'}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading && <Spinner />}
                  <span>{view === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-zinc-500 mt-6 leading-relaxed">
          Protected by AES-256-GCM encryption & server-enforced time locks.
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p>{msg}</p>
    </div>
  );
}

function Spinner() {
  return <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Try again or reset password.',
    'auth/invalid-credential':   'Incorrect email or password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/too-many-requests':    'Too many attempts. Please try again shortly.',
    'auth/popup-closed-by-user': 'Sign in popup was closed.',
    'auth/network-request-failed': 'Network connection issue.',
    'auth/user-disabled':        'This account has been disabled.',
  };
  return map[code] || 'Authentication error. Please try again.';
}
