import { useAuth } from '../context/AuthContext';
import { LogOut, Snowflake } from 'lucide-react';

export default function Navbar() {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[#90CAF9]/15 bg-[#040c1a]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E88E5]/30 to-[#0D47A1]/40 border border-[#90CAF9]/30 flex items-center justify-center shadow-[0_0_15px_rgba(33,150,243,0.3)]">
            <Snowflake className="w-4 h-4 text-[#90CAF9] animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight text-[#E3F2FD]">
              Time<span className="text-[#90CAF9]">Vault</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#90CAF9] px-2 py-0.5 rounded-full bg-[#0D47A1]/30 border border-[#90CAF9]/25 shadow-sm">
              Deep Freeze
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-[#90CAF9] bg-[#0c1d38]/80 border border-[#90CAF9]/20 px-3 py-1.5 rounded-full backdrop-blur-md">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="w-5 h-5 rounded-full object-cover border border-[#90CAF9]/40"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#2196F3]/20 text-[#E3F2FD] flex items-center justify-center font-bold text-[10px] border border-[#2196F3]/40">
                  {(currentUser.email || currentUser.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium text-[#E3F2FD] max-w-[150px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-[#90CAF9]/80 hover:text-[#E3F2FD] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#0D47A1]/30 border border-transparent hover:border-[#90CAF9]/25"
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
