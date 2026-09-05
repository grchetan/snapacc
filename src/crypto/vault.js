/**
 * Time Vault — AES-256-GCM Encryption Engine
 *
 * Architecture:
 *  vaultItems   → encPass (encrypted with masterKey — masterKey never shown to user)
 *  vaultSecrets → encMaster (server time-locked by Firestore rules)
 *
 *  Lock karo → forget karo → timer expire → auto reveal.
 *  Koi emergency unlock nahi, koi recovery key nahi.
 */

const PBKDF2_ITERATIONS = 200_000;
const KEY_LENGTH = 256;
const MASTER_KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const MASTER_KEY_LENGTH = 20;

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}
function strToBytes(str) { return new TextEncoder().encode(str); }
function bytesToStr(buf) { return new TextDecoder().decode(buf); }

/** Generates a 20-char random master key. Never shown to user — stored internally. */
export function generateMasterKey() {
  const rand = new Uint8Array(MASTER_KEY_LENGTH * 2);
  crypto.getRandomValues(rand);
  let key = '';
  for (let i = 0; i < rand.length && key.length < MASTER_KEY_LENGTH; i++) {
    key += MASTER_KEY_CHARS[rand[i] % MASTER_KEY_CHARS.length];
  }
  return key;
}

async function deriveKey(passphrase, salt) {
  const km = await crypto.subtle.importKey('raw', strToBytes(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

async function aesEncrypt(plaintext, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(passphrase, salt);
  const enc  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, strToBytes(plaintext));
  return { ciphertext: bufToBase64(enc), iv: bufToBase64(iv), salt: bufToBase64(salt) };
}

async function aesDecrypt(ciphertext, iv, salt, passphrase) {
  const key = await deriveKey(passphrase, base64ToBuf(salt));
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBuf(iv) }, key, base64ToBuf(ciphertext));
  return bytesToStr(dec);
}

/**
 * Encrypts a password. masterKey is generated internally — never exposed to user.
 * Returns fields split between vaultItems and vaultSecrets.
 */
export async function encryptPassword(password, masterKey, unlockTime) {
  const layer1 = await aesEncrypt(password, `${masterKey}|${unlockTime}`);
  const layer2 = await aesEncrypt(masterKey, unlockTime.toString());
  return {
    encPass:    layer1.ciphertext,
    ivPass:     layer1.iv,
    saltPass:   layer1.salt,
    encMaster:  layer2.ciphertext,
    ivMaster:   layer2.iv,
    saltMaster: layer2.salt,
  };
}

/**
 * AUTO-UNLOCK only path.
 * Requires secretData from vaultSecrets — which Firebase only returns after timer expires.
 */
export async function decryptAfterUnlock(vaultItem, secretData) {
  const { encMaster, ivMaster, saltMaster, unlockTime } = secretData;
  const masterKey = await aesDecrypt(encMaster, ivMaster, saltMaster, unlockTime.toString());
  return aesDecrypt(vaultItem.encPass, vaultItem.ivPass, vaultItem.saltPass, `${masterKey}|${unlockTime}`);
}
