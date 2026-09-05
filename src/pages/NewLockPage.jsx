import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import DurationPicker from '../components/DurationPicker';
import { encryptPassword, generateMasterKey } from '../crypto/vault';
import { createVaultItem } from '../services/vaultService';
import { useAuth } from '../context/AuthContext';

export default function NewLockPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [label, setLabel]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [durationMs, setDurationMs]   = useState(null);
  const [durationLabel, setDurationLabel] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(false);

  const canSubmit = label.trim() && password && durationMs && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const masterKey  = generateMasterKey(); // internal only — never shown
      const unlockTime = Date.now() + durationMs;
      const encrypted  = await encryptPassword(password, masterKey, unlockTime);

      await createVaultItem(currentUser.uid, {
        label: label.trim(),
        ...encrypted,
        unlockTime,
        durationLabel,
      });

      // Show brief success, then go home
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (e) {
      console.error('Lock error:', e);
      const msg = e?.code === 'permission-denied'
        ? '⛔ Firestore permission denied. Make sure security rules are published.'
        : e?.code === 'unavailable'
        ? '📡 Cannot reach Firestore. Make sure Firestore Database is created in Firebase Console.'
        : e?.code
        ? `Firebase error: ${e.code}`
        : `Error: ${e?.message || 'Unknown. Check browser console (F12).'}`;
      setError(msg);
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-vault-text mb-1">{label} Locked!</h2>
          <p className="text-sm text-vault-muted">Redirecting to your vault…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-bg">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-vault-muted hover:text-vault-text transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-vault-text">Lock a Password</h1>
              <p className="text-xs text-vault-muted">Once locked, no access until timer ends</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account name */}
            <div>
              <label className="block text-sm font-medium text-vault-text mb-1.5">Account / App Name</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                placeholder="e.g. Snapchat, Instagram, PUBG..."
                className="w-full px-4 py-3 rounded-xl bg-vault-surface border border-vault-border text-sm text-vault-text placeholder:text-vault-muted outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-vault-text mb-1.5">Password to Lock</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter the password you want to lock..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-vault-surface border border-vault-border text-sm text-vault-text placeholder:text-vault-muted outline-none focus:border-amber-500/50 transition-all font-mono"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-vault-muted hover:text-vault-text">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-vault-muted">⚠️ Type the correct password — once locked, it cannot be verified or changed.</p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-vault-text mb-3">
                Lock Duration
                {durationLabel && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-normal">
                    {durationLabel} selected
                  </span>
                )}
              </label>
              <DurationPicker value={durationMs} onChange={(ms, lbl) => { setDurationMs(ms); setDurationLabel(lbl); }} />
            </div>

            {/* Info */}
            <div className="px-4 py-3 rounded-xl bg-vault-surface border border-vault-border flex items-center gap-2.5">
              <span className="text-lg">🔐</span>
              <p className="text-xs text-vault-muted leading-relaxed">
                Password is encrypted and locked on our servers until the timer expires. Nobody can access it before that — not even you.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> Locking…</>
              ) : (
                <><Lock className="w-4 h-4" /> Lock it</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
