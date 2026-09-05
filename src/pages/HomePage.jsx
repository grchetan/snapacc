import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Snowflake, Unlock, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import VaultCard from '../components/VaultCard';
import SnowEffect from '../components/SnowEffect';
import { useAuth } from '../context/AuthContext';
import { subscribeToVaultItems, pingHealth } from '../services/vaultService';

export default function HomePage() {
  const { currentUser } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    // Daily health ping
    pingHealth(currentUser.uid).catch(() => {});

    // Safety timeout: Never leave user stuck on skeleton loading if network is slow
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const unsub = subscribeToVaultItems(
      currentUser.uid,
      (data) => {
        clearTimeout(safetyTimer);
        setItems(data);
        setLoading(false);
        setDbError(null);
      },
      (err) => {
        clearTimeout(safetyTimer);
        setLoading(false);
        if (err?.code === 'permission-denied') {
          setDbError('Security rules verification failed. Please check your Firestore rules.');
        } else if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
          setDbError('Unable to connect to database. Please check your connection.');
        } else {
          setDbError(`Database status: ${err?.code || err?.message}`);
        }
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      unsub();
    };
  }, [currentUser]);

  const locked   = items.filter(i => Date.now() < i.unlockTime);
  const unlocked = items.filter(i => Date.now() >= i.unlockTime);

  return (
    <div className="min-h-screen bg-[#030812] text-[#E3F2FD] flex flex-col relative overflow-hidden">
      {/* Falling Snow Background & Cold Ambient Glow */}
      <SnowEffect />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-8 flex-1 w-full">
          {/* Error Banner */}
          {dbError && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-2xl bg-red-950/40 border border-red-400/30 text-xs text-red-200 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">Connection Error</p>
                <p className="text-red-400/80 mt-0.5">{dbError}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Metric Cards */}
          {items.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <MetricCard
                icon={Snowflake}
                label="Frozen Locks"
                value={locked.length}
                variant="frozen"
              />
              <MetricCard
                icon={Unlock}
                label="Thawed"
                value={unlocked.length}
                variant="thawed"
              />
              <MetricCard
                icon={Layers}
                label="Total Vaults"
                value={items.length}
                variant="neutral"
              />
            </div>
          )}

          {/* Action Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#E3F2FD]">
                  {loading && items.length === 0 ? 'Syncing Cold Storage...' : items.length === 0 && !dbError ? 'Cold Vault' : 'Your Frozen Vaults'}
                </h1>
                <button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1000);
                  }}
                  className="p-1 rounded text-[#90CAF9]/60 hover:text-[#E3F2FD] transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#90CAF9]' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-[#90CAF9]/70 mt-0.5">
                Passwords locked in deep cryo with server-enforced countdown timers
              </p>
            </div>

            <Link
              to="/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] hover:from-[#2196F3] hover:to-[#64B5F6] text-[#E3F2FD] font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(33,150,243,0.35)]"
            >
              <Plus className="w-4 h-4" />
              <span>Freeze Password</span>
            </Link>
          </div>

          {/* Skeleton Loading */}
          {loading && items.length === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map(i => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-[#0c1d38]/40 border border-[#90CAF9]/15 animate-pulse backdrop-blur-md"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !dbError && items.length === 0 && (
            <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-[#90CAF9]/20 bg-[#081730]/40 backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5]/20 to-[#0D47A1]/30 border border-[#90CAF9]/30 flex items-center justify-center mx-auto mb-4 text-[#90CAF9] shadow-[0_0_20px_rgba(33,150,243,0.25)]">
                <Snowflake className="w-7 h-7 animate-pulse" />
              </div>
              <h2 className="text-base font-semibold text-[#E3F2FD] mb-1">
                No Frozen Passwords Yet
              </h2>
              <p className="text-xs text-[#90CAF9]/80 max-w-sm mx-auto mb-6 leading-relaxed">
                Lock distracting social media, gaming, or confidential accounts in deep freeze behind an unbreakable timer.
              </p>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#2196F3] hover:from-[#2196F3] hover:to-[#64B5F6] text-[#E3F2FD] font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(33,150,243,0.35)]"
              >
                <Plus className="w-4 h-4" />
                <span>Freeze First Account</span>
              </Link>
            </div>
          )}

          {/* Frozen Active Section */}
          {!loading && locked.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-[#90CAF9]">
                <Snowflake className="w-3.5 h-3.5 text-[#90CAF9]" />
                <span>Deep Frozen ({locked.length})</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {locked.map(item => (
                  <VaultCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Thawed Unlocked Section */}
          {!loading && unlocked.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thawed & Ready to Decrypt ({unlocked.length})</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {unlocked.map(item => (
                  <VaultCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, variant = 'neutral' }) {
  const styles = {
    frozen: {
      badge: 'bg-[#0D47A1]/40 text-[#90CAF9] border-[#90CAF9]/30 shadow-[0_0_12px_rgba(33,150,243,0.3)]',
      border: 'border-[#90CAF9]/20 bg-gradient-to-b from-[#0c2244]/70 to-[#081730]/80 shadow-[0_4px_20px_rgba(13,71,161,0.2)]',
    },
    thawed: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      border: 'border-emerald-500/20 bg-gradient-to-b from-[#0a274c]/70 to-[#071933]/80 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
    },
    neutral: {
      badge: 'bg-[#07172e] text-[#90CAF9]/70 border-[#90CAF9]/20',
      border: 'border-[#90CAF9]/15 bg-gradient-to-b from-[#0a1b36]/60 to-[#061224]/70',
    },
  };

  const current = styles[variant] || styles.neutral;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all ${current.border}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] sm:text-xs font-semibold text-[#90CAF9] uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${current.badge}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E3F2FD] font-mono">
        {value}
      </p>
    </div>
  );
}
