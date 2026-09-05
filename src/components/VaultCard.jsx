import { useState, useCallback } from 'react';
import { Unlock, Copy, Check, Trash2, Eye, EyeOff, Snowflake, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from './CountdownTimer';
import ProgressBar from './ProgressBar';
import { decryptAfterUnlock } from '../crypto/vault';
import { fetchVaultSecret, deleteVaultItem } from '../services/vaultService';
import { useAuth } from '../context/AuthContext';

export default function VaultCard({ item }) {
  const { currentUser } = useAuth();
  const [isExpired, setIsExpired]       = useState(Date.now() >= item.unlockTime);
  const [revealedPwd, setRevealedPwd]   = useState(null);
  const [showPwd, setShowPwd]           = useState(false);
  const [copying, setCopying]           = useState(false);
  const [decrypting, setDecrypting]     = useState(false);
  const [showDelete, setShowDelete]     = useState(false);
  const [error, setError]               = useState(null);

  const handleExpired = useCallback(() => setIsExpired(true), []);

  const handleReveal = async () => {
    if (revealedPwd) {
      setShowPwd(p => !p);
      return;
    }
    setDecrypting(true);
    setError(null);
    try {
      const secretData = await fetchVaultSecret(currentUser.uid, item.id);
      const pwd = await decryptAfterUnlock(item, secretData);
      setRevealedPwd(pwd);
      setShowPwd(true);
    } catch (e) {
      if (e?.code === 'permission-denied') {
        setError('Verification rejected: Freeze duration is still active on server.');
      } else {
        setError('Failed to decrypt password. Please try again.');
      }
    } finally {
      setDecrypting(false);
    }
  };

  const handleCopy = async () => {
    if (!revealedPwd) return;
    await navigator.clipboard.writeText(revealedPwd);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await deleteVaultItem(currentUser.uid, item.id);
    } catch (e) {
      setError('Could not delete item. Please refresh and retry.');
      setShowDelete(false);
    }
  };

  const unlockDate = format(new Date(item.unlockTime), 'MMM d, yyyy · h:mm a');

  return (
    <div
      className={`
        rounded-2xl p-5 transition-all duration-300 relative backdrop-blur-xl border
        ${isExpired
          ? 'border-emerald-400/40 bg-gradient-to-b from-[#0a274c]/80 via-[#071933]/80 to-[#040e1e]/90 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
          : 'border-[#90CAF9]/20 bg-gradient-to-b from-[#0c2244]/65 via-[#081730]/75 to-[#050f21]/85 shadow-[0_4px_25px_rgba(13,71,161,0.25)] hover:border-[#90CAF9]/40 hover:shadow-[0_4px_30px_rgba(33,150,243,0.25)]'
        }
      `}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
              ${isExpired
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-gradient-to-br from-[#1E88E5]/25 to-[#0D47A1]/40 border-[#90CAF9]/35 text-[#90CAF9] shadow-[0_0_15px_rgba(33,150,243,0.3)]'
              }
            `}
          >
            {isExpired ? (
              <Unlock className="w-5 h-5 text-emerald-300" />
            ) : (
              <Snowflake className="w-5 h-5 text-[#90CAF9]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-[#E3F2FD] text-sm sm:text-base tracking-tight truncate">
              {item.label}
            </h3>
            <p className="text-xs text-[#90CAF9]/80 mt-0.5">
              {isExpired ? (
                <span className="text-emerald-300 font-medium">Thawed & Ready to Decrypt</span>
              ) : (
                `Frozen until ${unlockDate}`
              )}
            </p>
          </div>
        </div>

        {/* Frozen Duration Badge */}
        <span
          className={`
            shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border
            ${isExpired
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
              : 'bg-[#0D47A1]/40 text-[#E3F2FD] border-[#90CAF9]/30 shadow-sm'
            }
          `}
        >
          {item.durationLabel}
        </span>
      </div>

      {/* Frozen State Body */}
      {!isExpired && (
        <div className="space-y-3 mb-4 p-3.5 rounded-xl bg-[#040e1e]/80 border border-[#90CAF9]/15">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-[#90CAF9]/90">Remaining to Thaw</span>
            <CountdownTimer unlockTime={item.unlockTime} onExpired={handleExpired} />
          </div>

          <ProgressBar createdAt={item.createdAt} unlockTime={item.unlockTime} />

          <div className="flex items-center gap-1.5 pt-2 border-t border-[#90CAF9]/10 text-[11px] text-[#90CAF9]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#90CAF9] shrink-0" />
            <span>Cryo-locked with AES-256 · Server refuses access until timer ends</span>
          </div>
        </div>
      )}

      {/* Unlocked State Body */}
      {isExpired && (
        <div className="mb-4">
          {revealedPwd ? (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#040e1e]/90 border border-emerald-400/30">
              <span className="font-mono text-sm text-[#E3F2FD] flex-1 break-all select-all">
                {showPwd ? revealedPwd : '••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="text-[#90CAF9] hover:text-[#E3F2FD] transition-colors shrink-0 p-1"
                title={showPwd ? 'Hide' : 'Show'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="px-3.5 py-3 rounded-xl bg-[#040e1e]/60 border border-[#90CAF9]/15 text-center">
              <p className="text-xs text-[#90CAF9]/80">
                Freeze period completed. Click <span className="text-[#E3F2FD] font-semibold">Reveal Password</span> to decrypt.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-950/40 border border-red-400/30 text-xs text-red-200">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {isExpired ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReveal}
              disabled={decrypting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#030812] font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {decrypting ? (
                <span className="w-3.5 h-3.5 border-2 border-[#030812]/30 border-t-[#030812] rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {revealedPwd ? (showPwd ? 'Hide Password' : 'Show Password') : 'Reveal Password'}
            </button>

            {revealedPwd && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D47A1]/30 hover:bg-[#0D47A1]/50 border border-[#90CAF9]/30 text-[#E3F2FD] text-xs font-medium transition-all shadow-sm"
              >
                {copying ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-[#90CAF9]" />}
                <span>{copying ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-[#90CAF9]/70 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2196F3] animate-pulse" />
            <span>Frozen · Locked</span>
          </div>
        )}

        {/* Delete Vault Button */}
        <div className="ml-auto">
          {showDelete ? (
            <div className="flex items-center gap-1.5 bg-[#030812] border border-[#90CAF9]/30 px-2 py-1 rounded-lg">
              <span className="text-[11px] text-[#90CAF9]/80 mr-1">Delete?</span>
              <button
                onClick={handleDelete}
                className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-[11px] font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="px-2 py-0.5 rounded bg-[#0D47A1]/30 hover:bg-[#0D47A1]/50 text-[#90CAF9] text-[11px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg text-[#90CAF9]/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Delete vault"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
