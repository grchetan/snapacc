import { useState, useCallback } from 'react';
import { Unlock, Copy, Check, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from './CountdownTimer';
import ProgressBar from './ProgressBar';
import { decryptAfterUnlock } from '../crypto/vault';
import { fetchVaultSecret, deleteVaultItem } from '../services/vaultService';
import { useAuth } from '../context/AuthContext';

/**
 * Vault card — two states:
 *   LOCKED:   Shows countdown + progress. No way to access password.
 *   UNLOCKED: Shows "Reveal password" button. Auto-decrypts via server-released data.
 *
 * No emergency unlock. No recovery key. Timer is the only key.
 */
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

  // Auto-unlock — only works after server confirms timer expired
  const handleReveal = async () => {
    if (revealedPwd) { setShowPwd(p => !p); return; }
    setDecrypting(true);
    setError(null);
    try {
      // Firebase server rejects this read if timer hasn't expired
      const secretData = await fetchVaultSecret(currentUser.uid, item.id);
      const pwd = await decryptAfterUnlock(item, secretData);
      setRevealedPwd(pwd);
      setShowPwd(true);
    } catch (e) {
      if (e?.code === 'permission-denied') {
        setError('Server says timer has not expired yet. Please wait.');
      } else {
        setError('Failed to decrypt. Try again.');
      }
    } finally {
      setDecrypting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(revealedPwd);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const unlockDate = format(new Date(item.unlockTime), 'MMM d, yyyy · h:mm a');

  return (
    <div className={`
      rounded-2xl border p-5 transition-all duration-500 animate-fade-in
      ${isExpired
        ? 'border-vault-green/40 bg-gradient-to-br from-green-950/30 to-vault-card'
        : 'border-vault-border bg-card-gradient'
      }
    `}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${isExpired ? 'bg-green-500/10' : 'bg-vault-surface'}`}>
            {isExpired ? '🔓' : '🔒'}
          </div>
          <div>
            <h3 className="font-semibold text-vault-text text-base">{item.label}</h3>
            <p className="text-xs text-vault-muted mt-0.5">
              {isExpired ? '✅ Unlocked — password ready' : `Unlocks ${unlockDate}`}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isExpired ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
          {item.durationLabel}
        </span>
      </div>

      {/* Locked state: countdown + progress */}
      {!isExpired && (
        <div className="space-y-2.5 mb-4 p-3 rounded-xl bg-vault-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs text-vault-muted">Time remaining</span>
            <CountdownTimer unlockTime={item.unlockTime} onExpired={handleExpired} />
          </div>
          <ProgressBar createdAt={item.createdAt} unlockTime={item.unlockTime} />
          {/* Locked message */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-vault-border">
            <Lock className="w-3 h-3 text-vault-muted" />
            <p className="text-xs text-vault-muted">Password is locked. No access until timer ends.</p>
          </div>
        </div>
      )}

      {/* Unlocked state: password area */}
      {isExpired && (
        <div className="mb-4">
          {revealedPwd ? (
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-vault-surface border border-green-500/30">
              <span className="font-mono text-sm text-vault-text flex-1 break-all">
                {showPwd ? revealedPwd : '•'.repeat(Math.min(revealedPwd.length, 20))}
              </span>
              <button onClick={() => setShowPwd(p => !p)} className="text-vault-muted hover:text-vault-text shrink-0 p-1">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="px-3 py-3 rounded-xl bg-vault-surface border border-vault-border text-center">
              <p className="text-sm text-vault-muted">Click "Reveal" to decrypt your password</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-950/20 border border-red-500/20">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isExpired && (
          <>
            <button
              onClick={handleReveal}
              disabled={decrypting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 text-sm font-medium transition-all disabled:opacity-50"
            >
              {decrypting
                ? <span className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                : revealedPwd ? (showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : <Unlock className="w-4 h-4" />
              }
              {revealedPwd ? (showPwd ? 'Hide' : 'Show') : 'Reveal password'}
            </button>
            {revealedPwd && (
              <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-vault-surface border border-vault-border text-vault-muted hover:text-vault-text text-sm transition-all">
                {copying ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copying ? 'Copied!' : 'Copy'}
              </button>
            )}
          </>
        )}

        {/* Delete */}
        <div className="ml-auto">
          {showDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-vault-muted">Delete?</span>
              <button onClick={() => deleteVaultItem(currentUser.uid, item.id)} className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-medium">Yes</button>
              <button onClick={() => setShowDelete(false)} className="px-2.5 py-1 rounded-lg bg-vault-surface border border-vault-border text-vault-muted text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowDelete(true)} className="p-2 rounded-lg text-vault-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
