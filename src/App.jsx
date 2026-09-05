import { Component, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isFirebaseConfigured } from './firebase/config';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import NewLockPage from './pages/NewLockPage';
import { Mail, RefreshCw, LogOut } from 'lucide-react';

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vault-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-vault-card border border-red-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-vault-text mb-2">App Error</h2>
            <p className="text-sm text-vault-muted mb-4 break-all">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Firebase Setup Screen ─────────────────────────────────────────────────────
function SetupScreen() {
  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-vault-text">Time<span className="text-amber-400">Vault</span></h1>
          <p className="text-sm text-vault-muted mt-2">One-time setup required</p>
        </div>
        <div className="bg-vault-card border border-amber-500/30 rounded-2xl p-6">
          <h2 className="font-bold text-vault-text mb-4">Firebase credentials missing</h2>
          <p className="text-sm text-vault-muted mb-4">Create <span className="font-mono text-amber-400 text-xs bg-vault-surface px-1.5 py-0.5 rounded">.env.local</span> in your project root:</p>
          <div className="rounded-xl bg-vault-surface border border-vault-border p-4 mb-4">
            <pre className="font-mono text-xs text-amber-300 whitespace-pre-wrap select-all">{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}</pre>
          </div>
          <ol className="space-y-2 text-sm text-vault-muted">
            {['Go to console.firebase.google.com → create project','Enable Authentication (Google + Email/Password)','Create Firestore Database (test mode)','Project Settings → Web App → copy firebaseConfig','Create .env.local → paste values → restart server'].map((s,i)=>(
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">{i+1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Email Verification Gate ───────────────────────────────────────────────────
/**
 * Shown to email/password users who haven't verified their email yet.
 * Google users are always verified — they skip this screen.
 */
function VerifyEmailScreen() {
  const { currentUser, resendVerificationEmail, reloadUser, signOut } = useAuth();
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [checking, setChecking] = useState(false);
  const [sendError, setSendError] = useState(null);

  const handleResend = async () => {
    setSending(true); setSendError(null);
    try {
      await resendVerificationEmail();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      setSendError(e.code === 'auth/too-many-requests'
        ? 'Too many requests. Please wait a few minutes.'
        : 'Failed to send. Please try again.');
    } finally { setSending(false); }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    await reloadUser();
    setChecking(false);
    // If still not verified, reloadUser will update currentUser
    // and this component will re-render (or unmount if verified)
  };

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-2xl font-bold text-vault-text">Time<span className="text-amber-400">Vault</span></h1>
        </div>

        <div className="bg-vault-card border border-amber-500/30 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-vault-text">Verify your email</h2>
              <p className="text-xs text-vault-muted">Required to secure your account</p>
            </div>
          </div>

          {/* Info */}
          <div className="px-4 py-3 rounded-xl bg-vault-surface border border-vault-border mb-5">
            <p className="text-sm text-vault-muted leading-relaxed">
              We sent a verification link to:
            </p>
            <p className="font-semibold text-vault-text mt-1 break-all">{currentUser?.email}</p>
          </div>

          <ol className="space-y-2.5 mb-5">
            {[
              'Open your email inbox',
              'Click the verification link we sent',
              'Come back here and click "I\'ve verified"',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-vault-muted">
                <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {sendError && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-950/20 border border-red-500/20">
              <p className="text-xs text-red-300">{sendError}</p>
            </div>
          )}

          {sent && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-green-950/20 border border-green-500/20">
              <p className="text-xs text-green-400">✅ Verification email sent! Check your inbox.</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            {/* Primary: check verification */}
            <button
              onClick={handleCheckVerified}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-sm transition-all disabled:opacity-50"
            >
              {checking
                ? <span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              {checking ? 'Checking…' : "I've verified — continue"}
            </button>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={sending || sent}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-vault-surface border border-vault-border text-vault-muted hover:text-vault-text text-sm transition-all disabled:opacity-50"
            >
              {sending
                ? <span className="w-4 h-4 border-2 border-vault-muted/30 border-t-vault-muted rounded-full animate-spin" />
                : <Mail className="w-4 h-4" />
              }
              {sent ? 'Email sent!' : sending ? 'Sending…' : 'Resend verification email'}
            </button>

            {/* Sign out */}
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-vault-muted hover:text-red-400 text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-vault-muted mt-4">
          Check spam/junk folder if you don't see the email.
        </p>
      </div>
    </div>
  );
}

// ─── Route Guards ─────────────────────────────────────────────────────────────

function isGoogleUser(user) {
  return user?.providerData?.some(p => p.providerId === 'google.com');
}

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" replace />;

  // Email/password users must verify their email first
  if (!currentUser.emailVerified && !isGoogleUser(currentUser)) {
    return <VerifyEmailScreen />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  // Let unverified users stay on auth page to see instructions
  if (currentUser && (currentUser.emailVerified || isGoogleUser(currentUser))) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/"    element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><NewLockPage /></ProtectedRoute>} />
      <Route path="*"    element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupScreen />;
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
