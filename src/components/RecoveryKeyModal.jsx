import { useState } from 'react';
import { Copy, Check, Mail, ShieldCheck, X } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Recovery key modal — shown once after locking a password.
 * User can copy key or send it to themselves via FutureMe.
 */
export default function RecoveryKeyModal({ masterKey, unlockTime, label, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(masterKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFutureMe = () => {
    const unlockDate = format(new Date(unlockTime), 'MMMM d, yyyy');
    const subject = encodeURIComponent(`Your Time Vault Recovery Key for "${label}"`);
    const body = encodeURIComponent(
      `Hi Future Me,\n\n` +
      `You locked "${label}" in Time Vault on ${format(new Date(), 'MMMM d, yyyy')}.\n\n` +
      `Your vault unlock date was: ${unlockDate}\n\n` +
      `Your recovery master key is:\n\n` +
      `  ${masterKey}\n\n` +
      `Keep this safe. You'll need it if you want to use Emergency Unlock.\n\n` +
      `— Past You`
    );
    const deliverOn = format(new Date(unlockTime), "yyyy-MM-dd'T'HH:mm");
    const url = `https://www.futureme.org/letters/new?to=&subject=${subject}&body=${body}&deliver_on=${deliverOn}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-vault-card border border-amber-500/30 rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-vault-text">Save Your Recovery Key</h2>
          <p className="text-sm text-vault-muted mt-1.5 leading-relaxed">
            This key is shown <strong className="text-amber-400">once only</strong> and never stored anywhere. 
            Save it now to enable Emergency Unlock.
          </p>
        </div>

        {/* Key display */}
        <div className="mb-6">
          <div className="relative px-4 py-4 rounded-xl bg-vault-surface border border-amber-500/30 text-center">
            <p className="font-mono text-lg tracking-widest text-amber-300 select-all break-all">
              {masterKey}
            </p>
            <p className="text-xs text-vault-muted mt-2">Click to select all · {masterKey.length} characters</p>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-950/20 border border-red-500/20">
          <p className="text-xs text-red-300 leading-relaxed">
            ⚠️ If you lose this key and need to unlock early, you will <strong>not</strong> be able to perform an emergency unlock. 
            The auto-unlock on the countdown date will still work.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-medium text-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to clipboard!' : 'Copy recovery key'}
          </button>

          <button
            onClick={handleFutureMe}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-vault-surface hover:bg-vault-border border border-vault-border text-vault-muted hover:text-vault-text font-medium text-sm transition-all"
          >
            <Mail className="w-4 h-4" />
            Email to future self (FutureMe)
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-vault-border text-vault-muted hover:text-vault-text text-sm transition-all"
          >
            I've saved it — close
          </button>
        </div>
      </div>
    </div>
  );
}
