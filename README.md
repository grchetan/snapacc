# TimeVault — Cold Storage Credential Vault

A high-assurance, zero-knowledge credential vault featuring **client-side AES-256-GCM encryption** and **server-enforced time locks**. 

TimeVault enables strict self-discipline and digital asset protection by locking sensitive credentials behind immutable countdown timers. Once committed, credentials cannot be unlocked, inspected, or modified by anyone—including the vault owner—until the server timer concludes.

---

## Key Highlights

- **Zero-Knowledge Architecture**: Credentials are encrypted client-side via the Web Crypto API using AES-256-GCM and PBKDF2 (200,000 rounds of SHA-256) prior to transmission. Plaintext secrets are never stored in memory or sent across the wire.
- **Atomic Server-Enforced Locks**: Decryption keys are decoupled into a dedicated collection governed by server-side security rules. Cloud atomic clocks evaluate unlock conditions, preventing client clock manipulation or bypass attempts.
- **Tamper-Proof Immutability**: Server rules enforce `allow update: false`, ensuring timer durations cannot be truncated or bypassed via API requests or script execution.
- **Persistent Local Cache**: Powered by IndexedDB offline persistence for instantaneous (0ms) interface loads and resilience against network latency.
- **Memory & Clipboard Hygiene**: Revealed credentials feature an automatic 45-second clipboard purge timer to prevent unauthorized persistence or exposure.

---

## Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, Tailwind CSS 3 |
| **Icons & Design** | Lucide Icons, Custom Frost & Canvas Particle Engine |
| **Cryptography** | Web Crypto API (AES-256-GCM, PBKDF2-SHA256, 128-bit Salt/IV) |
| **Backend & Database** | Firebase Authentication, Google Cloud Firestore |
| **Deployment** | Vercel (Edge Network with SPA Rewrites) |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/time-vault.git
   cd time-vault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and specify your project parameters:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_web_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Launch the local development server:
   ```bash
   npm run dev
   ```

5. Build for production deployment:
   ```bash
   npm run build
   ```

---

## Security Model & Decoupled Storage

```
[ Plaintext Password ]
       │
       ▼ (Client-Side AES-256-GCM)
 ┌───────────────────────────┬────────────────────────────┐
 │ Layer 1: Encrypted Cipher │ Layer 2: Time-Locked Secret │
 ├───────────────────────────┼────────────────────────────┤
 │ Stored in `vaultItems`    │ Stored in `vaultSecrets`   │
 │ Always accessible metadata│ Read blocked until T_unlock│
 └───────────────────────────┴────────────────────────────┘
```

1. **Locking Phase**:
   - The client generates a high-entropy 20-character master key.
   - Password is encrypted with `PBKDF2(masterKey | unlockTime)`.
   - Master key is encrypted with `PBKDF2(unlockTime.toString())`.
   - The cipher and secret are stored in isolated collections. The plaintext master key is immediately garbage collected from memory.

2. **Unlocking Phase**:
   - When the countdown finishes, the client requests the secret layer.
   - Google Firestore evaluates the atomic server clock (`request.time >= unlockTime`).
   - If verified, the encrypted master key is released to the client.
   - The client derives the decryption keys and renders the credential on-demand.

---

## License & Notice

This software is developed for personal self-discipline and secure asset custody. All stored cryptographic material is zero-knowledge and end-to-end encrypted.
