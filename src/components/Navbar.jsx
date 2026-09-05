import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { currentUser, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-vault-text">
            Time<span className="text-amber-400">Vault</span>
          </span>
        </div>

        {/* User + Sign out */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-vault-muted">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="w-7 h-7 rounded-full border border-vault-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {(currentUser.email || currentUser.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="max-w-[160px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-vault-muted hover:text-vault-text transition-colors px-3 py-1.5 rounded-lg hover:bg-vault-surface border border-transparent hover:border-vault-border"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
