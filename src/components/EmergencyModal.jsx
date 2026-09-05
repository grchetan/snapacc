import { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, KeyRound } from 'lucide-react';

const SHAME_PHRASE = 'I am breaking my own commitment';

/**
 * Emergency unlock modal.
 * Requires user to type the shame phrase AND provide their master key.
 */
export default function EmergencyModal({ itemLabel, onConfirm, onCancel }) {
  const [phrase, setPhrase] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const phraseMatch = phrase === SHAME_PHRASE;
  const canSubmit = phraseMatch && masterKey.trim().length > 0 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(masterKey.trim());
    } catch (err) {
      setError(err.message || 'Emergency unlock failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-vault-card border border-red-500/30 rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-vault-text">Emergency Unlock</h2>
              <p className="text-xs text-vault-muted mt-0.5">Breaking: <span className="text-vault-text">{itemLabel}</span></p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-5 p-4 rounded-xl bg-red-950/30 border border-red-500/20">
          <p className="text-sm text-red-300 leading-relaxed">
            You are about to break your own commitment. This action will be recorded. 
            Think carefully — is this truly an emergency?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shame phrase */}
          <div>
            <label className="block text-sm font-medium text-vault-text mb-1.5">
              Type exactly to confirm:
            </label>
            <p className="mb-2 px-3 py-2 rounded-lg bg-vault-surface border border-vault-border font-mono text-sm text-red-400 select-none">
              {SHAME_PHRASE}
            </p>
            <input
              ref={inputRef}
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Type the phrase above..."
              className={`
                w-full px-4 py-2.5 rounded-xl bg-vault-surface text-sm text-vault-text placeholder:text-vault-muted outline-none transition-all border
                ${phrase.length === 0
                  ? 'border-vault-border'
                  : phraseMatch
                  ? 'border-green-500/50 bg-green-950/20'
                  : 'border-red-500/40'
                }
              `}
              autoComplete="off"
              spellCheck={false}
            />
            {phrase.length > 0 && !phraseMatch && (
              <p className="mt-1 text-xs text-red-400">Phrase doesn't match — type it exactly.</p>
            )}
          </div>

          {/* Master key */}
          <div>
            <label className="block text-sm font-medium text-vault-text mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Your recovery master key
            </label>
            <div className="relative">
              <input
                type={showMasterKey ? 'text' : 'password'}
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Enter your 20-character master key..."
                className="w-full px-4 py-2.5 pr-20 rounded-xl bg-vault-surface border border-vault-border text-sm text-vault-text placeholder:text-vault-muted font-mono outline-none focus:border-amber-500/50 transition-all"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowMasterKey(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-vault-muted hover:text-amber-400 transition-colors px-1"
              >
                {showMasterKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-1 text-xs text-vault-muted">
              Characters typed: <span className={masterKey.trim().length === 20 ? 'text-green-400 font-medium' : 'text-amber-400'}>{masterKey.trim().length}</span>/20
              {masterKey.trim().length === 20 && ' ✓'}
            </p>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-950/30 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-vault-border bg-vault-surface text-vault-muted hover:text-vault-text text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              )}
              Break commitment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
