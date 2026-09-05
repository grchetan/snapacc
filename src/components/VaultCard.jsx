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
          ? 'border-emerald-300/80 bg-white/95 shadow-[0_8px_30px_rgba(16,185,129,0.12)]'
          : 'border-white/80 bg-white/85 shadow-[0_8px_30px_rgba(13,71,161,0.08)] hover:shadow-[0_10px_35px_rgba(13,71,161,0.15)] hover:border-white'
        }
      `}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm
              ${isExpired
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                : 'bg-[#E3F2FD] border-[#90CAF9] text-[#0D47A1]'
              }
            `}
          >
            {isExpired ? (
              <Unlock className="w-5 h-5 text-emerald-600" />
            ) : (
              <Snowflake className="w-5 h-5 text-[#1E88E5]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-[#0A2558] text-sm sm:text-base tracking-tight truncate">
              {item.label}
            </h3>
            <p className="text-xs text-[#1E4E8C] mt-0.5 font-medium">
              {isExpired ? (
                <span className="text-emerald-700 font-semibold">Thawed & Ready to Decrypt</span>
              ) : (
                `Frozen until ${unlockDate}`
              )}
            </p>
          </div>
        </div>

        {/* Frozen Duration Badge */}
        <span
          className={`
            shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm
            ${isExpired
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-[#E3F2FD] text-[#0D47A1] border-[#90CAF9]'
            }
          `}
        >
          {item.durationLabel}
        </span>
      </div>

      {/* Frozen State Body */}
      {!isExpired && (
        <div className="space-y-3 mb-4 p-3.5 rounded-xl bg-[#F0F7FF]/90 border border-blue-100/90 shadow-inner">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#0D47A1]">Time Remaining</span>
            <CountdownTimer unlockTime={item.unlockTime} onExpired={handleExpired} />
          </div>

          <ProgressBar createdAt={item.createdAt} unlockTime={item.unlockTime} />

          <div className="flex items-center gap-1.5 pt-2 border-t border-blue-200/50 text-[11px] text-[#2C5282]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />
            <span>Cryo-locked with AES-256 · Server refuses access until timer ends</span>
          </div>
        </div>
      )}

      {/* Unlocked State Body */}
      {isExpired && (
        <div className="mb-4">
          {revealedPwd ? (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-white border border-emerald-300 shadow-sm">
              <span className="font-mono text-sm text-[#0A2558] font-bold flex-1 break-all select-all">
                {showPwd ? revealedPwd : '••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="text-zinc-400 hover:text-[#0D47A1] transition-colors shrink-0 p-1"
                title={showPwd ? 'Hide' : 'Show'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="px-3.5 py-3 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-center">
              <p className="text-xs text-emerald-800 font-medium">
                Freeze period completed. Click <span className="text-emerald-900 font-bold">Reveal Password</span> to decrypt.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {decrypting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {revealedPwd ? (showPwd ? 'Hide Password' : 'Show Password') : 'Reveal Password'}
            </button>

            {revealedPwd && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E3F2FD] hover:bg-blue-100 border border-[#90CAF9] text-[#0D47A1] text-xs font-semibold transition-all shadow-sm"
              >
                {copying ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#1E88E5]" />}
                <span>{copying ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-[#1E4E8C] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1E88E5] animate-pulse" />
            <span>Frozen · Locked</span>
          </div>
        )}

        {/* Delete Vault Button */}
        <div className="ml-auto">
          {showDelete ? (
            <div className="flex items-center gap-1.5 bg-white border border-red-200 px-2.5 py-1 rounded-lg shadow-sm">
              <span className="text-[11px] text-red-800 font-medium mr-1">Delete?</span>
              <button
                onClick={handleDelete}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg text-[#1E4E8C]/60 hover:text-red-600 hover:bg-red-50 transition-colors"
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
