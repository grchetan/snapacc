import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ─── Vault Items (Metadata + Password Layer) ──────────────────────────────────

export async function createVaultItem(userId, { label, encPass, ivPass, saltPass, encMaster, ivMaster, saltMaster, unlockTime, durationLabel }) {
  // Write password layer (always readable — useless without masterKey)
  const metaRef = collection(db, 'users', userId, 'vaultItems');
  const docRef  = await addDoc(metaRef, {
    label,
    encPass, ivPass, saltPass,
    unlockTime,
    createdAt: Date.now(),
    durationLabel,
  });

  // Write master key layer (server time-locked — Firebase refuses to return before unlockTime)
  await setDoc(doc(db, 'users', userId, 'vaultSecrets', docRef.id), {
    encMaster, ivMaster, saltMaster,
    unlockTime,
  });

  return docRef.id;
}

export function subscribeToVaultItems(userId, callback, onError) {
  const q = query(collection(db, 'users', userId, 'vaultItems'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err)  => { if (onError) onError(err); }
  );
}

/** Fetch master key layer — Firebase server enforces time lock here */
export async function fetchVaultSecret(userId, itemId) {
  const snap = await getDoc(doc(db, 'users', userId, 'vaultSecrets', itemId));
  if (!snap.exists()) throw new Error('Secret not found.');
  return snap.data();
}

export async function deleteVaultItem(userId, itemId) {
  await Promise.all([
    deleteDoc(doc(db, 'users', userId, 'vaultItems', itemId)),
    deleteDoc(doc(db, 'users', userId, 'vaultSecrets', itemId)),
  ]);
}

// ─── Health Ping — keeps Firestore active daily ───────────────────────────────
/**
 * Writes a daily timestamp to Firestore.
 * Ensures database has activity every day so Firebase never considers it idle.
 * Call this on every app open.
 */
export async function pingHealth(userId) {
  try {
    const today = new Date().toISOString().slice(0, 10); // "2026-09-05"
    const storageKey = `tv_health_ping_${userId}`;
    if (localStorage.getItem(storageKey) === today) {
      return; // Already recorded today, skip redundant write
    }
    await setDoc(
      doc(db, 'users', userId, 'health', today),
      { ts: Date.now(), date: today },
      { merge: true }
    );
    localStorage.setItem(storageKey, today);
  } catch (e) {
    // Fail silently so health ping never interrupts normal user flow
    console.debug('Health ping notice:', e);
  }
}
