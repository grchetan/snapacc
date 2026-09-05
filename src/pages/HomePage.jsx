import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Unlock, AlertCircle, RefreshCw } from 'lucide-react';
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

    // Daily health ping — keeps Firestore active (silently)
    pingHealth(currentUser.uid).catch(() => {});

    const unsub = subscribeToVaultItems(
      currentUser.uid,
      (data) => { setItems(data); setLoading(false); setDbError(null); },
      (err)  => {
        setLoading(false);
        if (err?.code === 'permission-denied') {
          setDbError('Firestore security rules not published yet. Go to Firebase Console → Firestore → Rules → Publish.');
        } else if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
          setDbError('Cannot connect to Firestore. Make sure the database is created in Firebase Console.');
        } else {
          setDbError(`Database error: ${err?.code || err?.message}`);
        }
      }
    );

    return unsub;
  }, [currentUser]);

  const locked   = items.filter(i => Date.now() < i.unlockTime);
  const unlocked = items.filter(i => Date.now() >= i.unlockTime);

  return (
    <div className="min-h-screen bg-vault-bg">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">

        {/* Database error banner */}
        {dbError && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-950/30 border border-red-500/30">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Database Connection Error</p>
              <p className="text-xs text-red-400/80 mt-0.5">{dbError}</p>
            </div>
            <button onClick={() => window.location.reload()} className="shrink-0 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats bar */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard icon="🔒" label="Active locks" value={locked.length}   color="amber" />
            <StatCard icon="🔓" label="Unlocked"     value={unlocked.length} color="green" />
            <StatCard icon="🏛️" label="Total"        value={items.length}    color="gray"  />
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-vault-text">
            {loading ? 'Loading…' : items.length === 0 && !dbError ? 'Your vault is empty' : 'Your Vaults'}
          </h2>
          <Link
            to="/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Lock
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-vault-card border border-vault-border animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !dbError && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-vault-text mb-2">No vaults yet</h3>
            <p className="text-sm text-vault-muted mb-6 max-w-xs mx-auto">
              Lock a social media or gaming password behind a countdown timer. Once locked, no one can access it until the timer ends.
            </p>
            <Link to="/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-sm transition-all">
              <Plus className="w-4 h-4" /> Create your first lock
            </Link>
          </div>
        )}

        {/* Locked items */}
        {!loading && locked.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-vault-muted mb-3 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Locked ({locked.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {locked.map(item => <VaultCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        {/* Unlocked items */}
        {!loading && unlocked.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-vault-muted mb-3 flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-green-400" /> Ready to reveal ({unlocked.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {unlocked.map(item => <VaultCard key={item.id} item={item} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    amber: 'bg-amber-500/5 border-amber-500/15',
    green: 'bg-green-500/5 border-green-500/15',
    gray:  'bg-vault-surface border-vault-border',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-vault-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold text-vault-text">{value}</p>
    </div>
  );
}
