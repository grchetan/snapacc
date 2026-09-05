import { useState, useCallback } from 'react';
import { Unlock, Copy, Check, Trash2, Eye, EyeOff, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
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
        setError('Server verification failed: The lock duration has not yet completed.');
      } else {
        setError('Unable to decrypt password. Please try again.');
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
      setError('Could not delete vault item. Please refresh and retry.');
      setShowDelete(false);
    }
  };

  const unlockDate = format(new Date(item.unlockTime), 'MMM d, yyyy · h:mm a');

  return (
    <div
      className={`
        rounded-2xl border p-5 transition-all duration-300 relative
        ${isExpired
          ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-900/90 to-zinc-900/90'
          : 'border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700/80 shadow-sm'
        }
      `}
    >
      {/* Top Bar: Icon, Name, Date, Duration Pill */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
              ${isExpired
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
              }
            `}
          >
            {isExpired ? (
              <Unlock className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-100 text-sm sm:text-base tracking-tight truncate">
              {item.label}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isExpired ? (
                <span className="text-emerald-400 font-medium">Ready to decrypt</span>
              ) : (
                `Locked until ${unlockDate}`
              )}
            </p>
          </div>
        </div>

        <span
          className={`
            shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border
            ${isExpired
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60'
            }
          `}
        >
          {item.durationLabel}
        </span>
      </div>

      {/* Locked State Panel */}
      {!isExpired && (
        <div className="space-y-3 mb-4 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-zinc-400">Remaining</span>
            <CountdownTimer unlockTime={item.unlockTime} onExpired={handleExpired} />
          </div>

          <ProgressBar createdAt={item.createdAt} unlockTime={item.unlockTime} />

          <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Encrypted with AES-256 · Auto-unlocks when timer reaches zero</span>
          </div>
        </div>
      )}

      {/* Unlocked State Panel */}
      {isExpired && (
        <div className="mb-4">
          {revealedPwd ? (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-zinc-950/80 border border-emerald-500/30">
              <span className="font-mono text-sm text-zinc-100 flex-1 break-all select-all">
                {showPwd ? revealedPwd : '••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 p-1"
                title={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="px-3.5 py-3 rounded-xl bg-zinc-950/50 border border-zinc-800/70 text-center">
              <p className="text-xs text-zinc-400">
                Lock completed. Click <span className="text-zinc-200 font-medium">Reveal Password</span> to decrypt your credential.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-950/20 border border-red-500/25 text-xs text-red-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {isExpired ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReveal}
              disabled={decrypting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all disabled:opacity-50"
            >
              {decrypting ? (
                <span className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
              {revealedPwd ? (showPwd ? 'Hide Password' : 'Show Password') : 'Reveal Password'}
            </button>

            {revealedPwd && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs font-medium transition-all"
              >
                {copying ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copying ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-zinc-500 font-medium">
            Lock active
          </div>
        )}

        {/* Delete Confirmation */}
        <div className="ml-auto">
          {showDelete ? (
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-lg">
              <span className="text-[11px] text-zinc-400 mr-1">Delete?</span>
              <button
                onClick={handleDelete}
                className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-[11px] font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
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
