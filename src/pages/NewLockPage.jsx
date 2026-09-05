import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import DurationPicker from '../components/DurationPicker';
import { encryptPassword, generateMasterKey } from '../crypto/vault';
import { createVaultItem } from '../services/vaultService';
import { useAuth } from '../context/AuthContext';

export default function NewLockPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [label, setLabel]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPwd, setShowPwd]             = useState(false);
  const [durationMs, setDurationMs]       = useState(null);
  const [durationLabel, setDurationLabel] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(false);

  const canSubmit = label.trim() && password && durationMs && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const masterKey  = generateMasterKey();
      const unlockTime = Date.now() + durationMs;
      const encrypted  = await encryptPassword(password, masterKey, unlockTime);

      await createVaultItem(currentUser.uid, {
        label: label.trim(),
        ...encrypted,
        unlockTime,
        durationLabel,
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 1400);
    } catch (e) {
      console.error('Lock creation error:', e);
      const msg = e?.code === 'permission-denied'
        ? 'Database permission denied. Check your Firestore rules in Firebase Console.'
        : e?.code === 'unavailable'
        ? 'Database unreachable. Please verify your connection.'
        : `Error: ${e?.message || 'Failed to save vault lock.'}`;
      setError(msg);
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center animate-slide-up max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100 mb-1">{label} Locked</h2>
          <p className="text-xs text-zinc-400">Your credential is encrypted. Redirecting to vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-8 flex-1 w-full">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vaults</span>
        </button>

        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-zinc-100">Create Time Lock</h1>
              <p className="text-xs text-zinc-400">
                Lock a password behind an immutable countdown timer
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account / Identifier */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Account or Platform
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                placeholder="e.g., Snapchat, Instagram, Steam"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Password to Lock */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Password to Lock
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter the password to lock..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title={showPwd ? 'Hide' : 'Show'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500 leading-relaxed">
                Confirm your password is accurate. Once locked, it cannot be recovered until the timer concludes.
              </p>
            </div>

            {/* Duration Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Lock Duration
                </label>
                {durationLabel && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    {durationLabel}
                  </span>
                )}
              </div>
              <DurationPicker
                value={durationMs}
                onChange={(ms, lbl) => {
                  setDurationMs(ms);
                  setDurationLabel(lbl);
                }}
              />
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Credentials are encrypted client-side with AES-256-GCM. Firebase servers strictly reject all retrieval attempts until the timer expires.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-amber-500/10"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  <span>Encrypting & Locking...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
