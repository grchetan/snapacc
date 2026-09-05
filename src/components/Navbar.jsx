import { useAuth } from '../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-base tracking-tight text-zinc-100">
              Time<span className="text-amber-400">Vault</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-500 px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800">
              Encrypted
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-full">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                  {(currentUser.email || currentUser.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium text-zinc-300 max-w-[150px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
