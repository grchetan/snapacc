import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Unlock, Layers, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import VaultCard from '../components/VaultCard';
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

    const unsub = subscribeToVaultItems(
      currentUser.uid,
      (data) => {
        setItems(data);
        setLoading(false);
        setDbError(null);
      },
      (err) => {
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

    return unsub;
  }, [currentUser]);

  const locked   = items.filter(i => Date.now() < i.unlockTime);
  const unlocked = items.filter(i => Date.now() >= i.unlockTime);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 flex-1 w-full">
        {/* Error Notification */}
        {dbError && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
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

        {/* Dashboard Metrics */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <MetricCard
              icon={Lock}
              label="Active Locks"
              value={locked.length}
              variant="amber"
            />
            <MetricCard
              icon={Unlock}
              label="Unlocked"
              value={unlocked.length}
              variant="emerald"
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
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
              {loading ? 'Loading Vaults...' : items.length === 0 && !dbError ? 'Vault Overview' : 'Your Vaults'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Secure time-locked credentials with server-side enforcement
            </p>
          </div>

          <Link
            to="/new"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all shadow-sm shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Lock</span>
          </Link>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map(i => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !dbError && items.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-900/30">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-zinc-200 mb-1">
              No Vaults Created Yet
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Lock distracting social media, gaming, or confidential passwords behind an immutable countdown timer.
            </p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Lock</span>
            </Link>
          </div>
        )}

        {/* Active Locked Section */}
        {!loading && locked.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Locks ({locked.length})</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {locked.map(item => (
                <VaultCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Unlocked / Ready Section */}
        {!loading && unlocked.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready to Decrypt ({unlocked.length})</span>
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
  );
}

function MetricCard({ icon: Icon, label, value, variant = 'neutral' }) {
  const styles = {
    amber: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      border: 'border-zinc-800/80 bg-zinc-900/60',
    },
    emerald: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      border: 'border-zinc-800/80 bg-zinc-900/60',
    },
    neutral: {
      badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      border: 'border-zinc-800/80 bg-zinc-900/60',
    },
  };

  const current = styles[variant] || styles.neutral;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${current.border}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${current.badge}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 font-mono">
        {value}
      </p>
    </div>
  );
}
