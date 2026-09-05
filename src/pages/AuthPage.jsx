import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, CheckCircle2, Snowflake } from 'lucide-react';
import SnowEffect from '../components/SnowEffect';
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
    <div className="min-h-screen bg-[#030812] text-[#E3F2FD] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Falling Snow Background */}
      <SnowEffect />

      <div className="w-full max-w-sm animate-slide-up relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5]/30 to-[#0D47A1]/40 border border-[#90CAF9]/40 flex items-center justify-center mx-auto mb-3 text-[#90CAF9] shadow-[0_0_25px_rgba(33,150,243,0.35)]">
            <Snowflake className="w-7 h-7 text-[#90CAF9] animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E3F2FD]">
            Time<span className="text-[#90CAF9]">Vault</span>
          </h1>
          <p className="text-xs text-[#90CAF9]/80 mt-1">
            Zero-knowledge cold storage credential lock
          </p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-b from-[#0c2244]/80 via-[#081730]/85 to-[#050f21]/90 border border-[#90CAF9]/25 rounded-2xl p-6 shadow-[0_4px_30px_rgba(13,71,161,0.3)] backdrop-blur-xl">
          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' ? (
            <>
              <button
                onClick={() => { setView('signin'); reset(); }}
                className="flex items-center gap-1.5 text-xs text-[#90CAF9]/80 hover:text-[#E3F2FD] transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#0D47A1]/40 border border-[#90CAF9]/30 flex items-center justify-center text-[#90CAF9] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#E3F2FD]">Reset Password</h2>
                  <p className="text-xs text-[#90CAF9]/80">We will send a reset link to your email</p>
                </div>
              </div>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center mx-auto mb-3 border border-emerald-400/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-xs text-[#E3F2FD] mb-1">Email Sent</h3>
                  <p className="text-xs text-[#90CAF9]/80 mb-4 leading-relaxed">
                    Check your inbox at <span className="text-[#E3F2FD] font-semibold">{email}</span> to reset your password.
                  </p>
                  <button
                    onClick={() => { setView('signin'); reset(); setEmail(''); }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] text-[#E3F2FD] text-xs font-semibold transition-all shadow-[0_0_15px_rgba(33,150,243,0.3)]"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#90CAF9] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#040e1e]/80 border border-[#90CAF9]/20 text-xs sm:text-sm text-[#E3F2FD] placeholder:text-[#90CAF9]/40 outline-none focus:border-[#2196F3] focus:shadow-[0_0_15px_rgba(33,150,243,0.3)] transition-all"
                      autoFocus
                    />
                  </div>

                  {error && <ErrorBox msg={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] hover:from-[#2196F3] hover:to-[#64B5F6] text-[#E3F2FD] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(33,150,243,0.35)]"
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
              <div className="flex rounded-xl bg-[#040e1e]/90 border border-[#90CAF9]/20 p-1 mb-5">
                {['signin', 'signup'].map(v => (
                  <button
                    key={v}
                    onClick={() => { setView(v); reset(); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      view === v
                        ? 'bg-gradient-to-r from-[#1E88E5]/80 to-[#2196F3]/80 text-[#E3F2FD] shadow-sm'
                        : 'text-[#90CAF9]/70 hover:text-[#E3F2FD]'
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
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-[#90CAF9]/20 bg-[#040e1e]/60 hover:bg-[#071933] text-[#E3F2FD] text-xs sm:text-sm font-medium transition-all disabled:opacity-50 mb-4 shadow-sm"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#90CAF9]/15" />
                </div>
                <div className="relative flex justify-center text-[10px] text-[#90CAF9]/60 uppercase tracking-widest">
                  <span className="bg-[#081730] px-2 font-medium">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#90CAF9] uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#040e1e]/80 border border-[#90CAF9]/20 text-xs sm:text-sm text-[#E3F2FD] placeholder:text-[#90CAF9]/40 outline-none focus:border-[#2196F3] focus:shadow-[0_0_15px_rgba(33,150,243,0.3)] transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#90CAF9] uppercase tracking-wider">
                      Password
                    </label>
                    {view === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); reset(); }}
                        className="text-xs text-[#90CAF9] hover:text-[#E3F2FD] transition-colors"
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
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#040e1e]/80 border border-[#90CAF9]/20 text-xs sm:text-sm text-[#E3F2FD] placeholder:text-[#90CAF9]/40 outline-none focus:border-[#2196F3] focus:shadow-[0_0_15px_rgba(33,150,243,0.3)] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90CAF9]/60 hover:text-[#E3F2FD] transition-colors"
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
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] hover:from-[#2196F3] hover:to-[#64B5F6] text-[#E3F2FD] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(33,150,243,0.35)]"
                >
                  {loading && <Spinner />}
                  <span>{view === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#90CAF9]/60 mt-6 leading-relaxed">
          Protected by AES-256-GCM encryption & server-enforced cold locks.
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-400/30 text-xs text-red-200">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p>{msg}</p>
    </div>
  );
}

function Spinner() {
  return <span className="w-3.5 h-3.5 border-2 border-[#E3F2FD]/30 border-t-[#E3F2FD] rounded-full animate-spin" />;
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
