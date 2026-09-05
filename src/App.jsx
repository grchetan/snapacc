import { Component, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isFirebaseConfigured } from './firebase/config';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import NewLockPage from './pages/NewLockPage';
import SnowEffect from './components/SnowEffect';
import { Mail, RefreshCw, LogOut, ShieldAlert, Snowflake, CheckCircle2 } from 'lucide-react';

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030812] text-[#E3F2FD] flex items-center justify-center p-6 relative overflow-hidden">
          <SnowEffect />
          <div className="max-w-md w-full bg-[#081730]/90 border border-red-400/30 rounded-2xl p-6 text-center relative z-10 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-400/25 flex items-center justify-center mx-auto mb-4 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#E3F2FD] mb-2">Application Error</h2>
            <p className="text-xs text-[#90CAF9]/80 mb-4 break-all">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] text-[#E3F2FD] text-xs font-semibold shadow-[0_0_15px_rgba(33,150,243,0.3)]"
            >
              Reload Application
            </button>
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
    <div className="min-h-screen bg-[#030812] text-[#E3F2FD] flex items-center justify-center p-4 relative overflow-hidden">
      <SnowEffect />
      <div className="w-full max-w-lg animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5]/30 to-[#0D47A1]/40 border border-[#90CAF9]/35 flex items-center justify-center mx-auto mb-4 text-[#90CAF9] shadow-[0_0_25px_rgba(33,150,243,0.35)]">
            <Snowflake className="w-7 h-7 text-[#90CAF9]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E3F2FD]">
            Time<span className="text-[#90CAF9]">Vault</span>
          </h1>
          <p className="text-xs text-[#90CAF9]/80 mt-1.5">Cold Storage Setup</p>
        </div>

        <div className="bg-[#081730]/90 border border-[#90CAF9]/25 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
          <h2 className="text-sm font-bold text-[#E3F2FD] mb-2">Firebase Configuration Required</h2>
          <p className="text-xs text-[#90CAF9]/80 mb-4">
            Provide the required credentials via environment variables:
          </p>

          <div className="rounded-xl bg-[#040e1e]/90 border border-[#90CAF9]/20 p-4 mb-5">
            <pre className="font-mono text-xs text-[#90CAF9] whitespace-pre-wrap select-all">{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}</pre>
          </div>

          <ol className="space-y-2 text-xs text-[#90CAF9]/80">
            {[
              'Create a project in console.firebase.google.com',
              'Enable Authentication (Google + Email/Password)',
              'Create a Firestore Database',
              'Copy configuration from Project Settings > General > Web Apps',
              'Add to .env and deploy',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D47A1]/40 text-[#E3F2FD] text-[10px] font-bold flex items-center justify-center shrink-0 border border-[#90CAF9]/30">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Email Verification Gate ───────────────────────────────────────────────────
function VerifyEmailScreen() {
  const { currentUser, resendVerificationEmail, reloadUser, signOut } = useAuth();
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [checking, setChecking]   = useState(false);
  const [sendError, setSendError] = useState(null);

  const handleResend = async () => {
    setSending(true);
    setSendError(null);
    try {
      await resendVerificationEmail();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      setSendError(e.code === 'auth/too-many-requests'
        ? 'Too many requests. Please wait a few moments.'
        : 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    await reloadUser();
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-[#030812] text-[#E3F2FD] flex items-center justify-center p-4 relative overflow-hidden">
      <SnowEffect />

      <div className="w-full max-w-sm animate-slide-up relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E88E5]/30 to-[#0D47A1]/40 border border-[#90CAF9]/35 flex items-center justify-center mx-auto mb-3 text-[#90CAF9] shadow-[0_0_20px_rgba(33,150,243,0.3)]">
            <Snowflake className="w-6 h-6 text-[#90CAF9]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#E3F2FD]">
            Time<span className="text-[#90CAF9]">Vault</span>
          </h1>
        </div>

        <div className="bg-[#081730]/90 border border-[#90CAF9]/25 rounded-2xl p-6 shadow-[0_4px_30px_rgba(13,71,161,0.25)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#0D47A1]/40 border border-[#90CAF9]/30 flex items-center justify-center text-[#90CAF9] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#E3F2FD]">Verify Your Email</h2>
              <p className="text-xs text-[#90CAF9]/80">Account confirmation required</p>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#040e1e]/80 border border-[#90CAF9]/20 mb-5">
            <p className="text-xs text-[#90CAF9]/70 leading-relaxed">
              We sent a verification link to:
            </p>
            <p className="font-semibold text-xs text-[#E3F2FD] mt-0.5 break-all">
              {currentUser?.email}
            </p>
          </div>

          <ol className="space-y-2 mb-5 text-xs text-[#90CAF9]/80">
            {[
              'Open your inbox and click the verification link',
              'Return here and click "I\'ve Verified"',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#0D47A1]/40 text-[#E3F2FD] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#90CAF9]/30">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {sendError && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-950/40 border border-red-400/30 text-xs text-red-200">
              {sendError}
            </div>
          )}

          {sent && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-400/30 text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verification email sent. Check your inbox.</span>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleCheckVerified}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] hover:from-[#2196F3] hover:to-[#64B5F6] text-[#E3F2FD] font-semibold text-xs transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(33,150,243,0.3)]"
            >
              {checking ? (
                <span className="w-3.5 h-3.5 border-2 border-[#E3F2FD]/30 border-t-[#E3F2FD] rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>{checking ? 'Checking...' : "I've Verified — Continue"}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={sending || sent}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#040e1e]/80 border border-[#90CAF9]/20 text-[#90CAF9] hover:text-[#E3F2FD] text-xs transition-all disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{sent ? 'Sent' : sending ? 'Sending...' : 'Resend Link'}</span>
            </button>

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-2 text-[#90CAF9]/60 hover:text-red-300 text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
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

  if (!currentUser.emailVerified && !isGoogleUser(currentUser)) {
    return <VerifyEmailScreen />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
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
