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
    <div className="min-h-screen bg-[#90CAF9] text-[#0A2558] flex flex-col relative overflow-hidden">
      {/* Falling Snow Background (#90CAF9 Light Frost, No Blobs) */}
      <SnowEffect />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-8 flex-1 w-full">
          {/* Error Banner */}
          {dbError && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-700 backdrop-blur-md shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-800">Connection Error</p>
                <p className="text-red-700 mt-0.5">{dbError}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600"
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
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0A2558]">
                  {loading && items.length === 0 ? 'Syncing Cold Storage...' : items.length === 0 && !dbError ? 'Cold Vault' : 'Your Frozen Vaults'}
                </h1>
                <button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1000);
                  }}
                  className="p-1 rounded text-[#1E4E8C] hover:text-[#0A2558] transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0D47A1]' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-[#1E4E8C] font-medium mt-0.5">
                Passwords locked in deep cryo with server-enforced countdown timers
              </p>
            </div>

            <Link
              to="/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] hover:from-[#2196F3] hover:to-[#1565C0] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20"
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
                  className="h-44 rounded-2xl bg-white/60 border border-white/80 animate-pulse backdrop-blur-md shadow-sm"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !dbError && items.length === 0 && (
            <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-white/80 bg-white/70 backdrop-blur-xl shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#90CAF9] flex items-center justify-center mx-auto mb-4 text-[#1E88E5] shadow-md shadow-blue-500/15">
                <Snowflake className="w-7 h-7 animate-pulse text-[#1E88E5]" />
              </div>
              <h2 className="text-base font-bold text-[#0A2558] mb-1">
                No Frozen Passwords Yet
              </h2>
              <p className="text-xs text-[#1E4E8C] font-medium max-w-sm mx-auto mb-6 leading-relaxed">
                Lock distracting social media, gaming, or confidential accounts in deep freeze behind an unbreakable timer.
              </p>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] hover:from-[#2196F3] hover:to-[#1565C0] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Freeze First Account</span>
              </Link>
            </div>
          )}

          {/* Frozen Active Section */}
          {!loading && locked.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[#0A2558]">
                <Snowflake className="w-3.5 h-3.5 text-[#0D47A1]" />
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
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Unlock className="w-3.5 h-3.5 text-emerald-700" />
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
      badge: 'bg-[#E3F2FD] text-[#0D47A1] border-[#90CAF9]',
      border: 'border-white/80 bg-white/85 shadow-sm',
    },
    thawed: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      border: 'border-white/80 bg-white/85 shadow-sm',
    },
    neutral: {
      badge: 'bg-[#E3F2FD] text-[#0D47A1] border-blue-200',
      border: 'border-white/80 bg-white/85 shadow-sm',
    },
  };

  const current = styles[variant] || styles.neutral;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all ${current.border}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] sm:text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${current.badge}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2558] font-mono">
        {value}
      </p>
    </div>
  );
}
