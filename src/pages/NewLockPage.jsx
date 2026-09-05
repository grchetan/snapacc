import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Snowflake, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import DurationPicker from '../components/DurationPicker';
import SnowEffect from '../components/SnowEffect';
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
        ? 'Database permission denied. Check your Firestore rules.'
        : e?.code === 'unavailable'
        ? 'Database unreachable. Please verify connection.'
        : `Error: ${e?.message || 'Failed to freeze credentials.'}`;
      setError(msg);
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#90CAF9] text-[#0A2558] flex items-center justify-center p-4 relative overflow-hidden">
        <SnowEffect />
        <div className="text-center animate-slide-up max-w-sm relative z-10 bg-white/90 p-8 rounded-3xl border border-white/80 shadow-lg backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] flex items-center justify-center mx-auto mb-4 text-white shadow-md shadow-blue-500/25">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-[#0A2558] mb-1">{label} Frozen</h2>
          <p className="text-xs text-[#1E4E8C] font-medium">Credential cryo-locked. Redirecting to vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#90CAF9] text-[#0A2558] flex flex-col relative overflow-hidden">
      {/* Falling Snow Background */}
      <SnowEffect />

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="mx-auto max-w-lg px-4 py-8 flex-1 w-full">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0D47A1] hover:text-[#0A2558] transition-colors mb-6 bg-white/60 px-3 py-1.5 rounded-full border border-white/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vaults</span>
          </button>

          <div className="bg-white/90 border border-white/80 rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(13,71,161,0.12)] backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] border border-[#90CAF9] flex items-center justify-center text-[#0D47A1] shrink-0 shadow-sm">
                <Snowflake className="w-5 h-5 text-[#1E88E5]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-[#0A2558]">Freeze a Password</h1>
                <p className="text-xs text-[#1E4E8C] font-medium">
                  Lock credentials in cold storage behind an unbypassable timer
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account or Platform */}
              <div>
                <label className="block text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-2">
                  Account or Platform
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  placeholder="e.g., Snapchat, Instagram, Steam"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-sm text-[#0A2558] placeholder:text-zinc-400 outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                />
              </div>

              {/* Password to Freeze */}
              <div>
                <label className="block text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-2">
                  Password to Freeze
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter the password to lock..."
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white border border-blue-200 text-sm text-[#0A2558] placeholder:text-zinc-400 outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-blue-100 transition-all font-mono shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-[#0D47A1] transition-colors"
                    title={showPwd ? 'Hide' : 'Show'}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-[#1E4E8C] font-medium leading-relaxed">
                  Confirm accuracy before freezing. Once locked, this password cannot be retrieved by anyone until the timer expires.
                </p>
              </div>

              {/* Freeze Duration Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">
                    Freeze Duration
                  </label>
                  {durationLabel && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9] font-bold shadow-sm">
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

              {/* Cold Storage Security Note */}
              <div className="p-3 rounded-xl bg-[#F0F7FF] border border-blue-100 flex items-start gap-2.5 text-xs text-[#1E4E8C]">
                <ShieldCheck className="w-4 h-4 text-[#1E88E5] shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] font-medium">
                  Encrypted client-side with AES-256-GCM. Firebase servers strictly reject all read requests until the freeze period is completed.
                </p>
              </div>

              {/* Error feedback */}
              {error && (
                <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] hover:from-[#2196F3] hover:to-[#1565C0] text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Freezing Credentials...</span>
                  </>
                ) : (
                  <>
                    <Snowflake className="w-4 h-4" />
                    <span>Freeze Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
