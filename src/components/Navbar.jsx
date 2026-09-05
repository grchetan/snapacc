import { useAuth } from '../context/AuthContext';
import { LogOut, Snowflake } from 'lucide-react';

export default function Navbar() {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_2px_15px_rgba(13,71,161,0.06)]">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-500/20">
            <Snowflake className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight text-[#0D47A1]">
              Time<span className="text-[#1E88E5]">Vault</span>
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#0D47A1] px-2 py-0.5 rounded-full bg-[#E3F2FD] border border-[#90CAF9] shadow-sm">
              Freeze
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#0D47A1] bg-white/90 border border-blue-100 px-3 py-1.5 rounded-full shadow-sm">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="w-5 h-5 rounded-full object-cover border border-blue-300"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold text-[10px]">
                  {(currentUser.email || currentUser.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-[#0A2558] max-w-[150px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1E4E8C] hover:text-[#0D47A1] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-transparent hover:border-blue-200"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
