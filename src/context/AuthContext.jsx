import { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  reload,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /** Google sign-in — auto verified by Google */
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  /** Email sign-in */
  const signInWithEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Email sign-up — automatically sends verification email.
   * User must verify before accessing the vault.
   */
  const signUpWithEmail = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Send verification email immediately after signup
    await sendEmailVerification(credential.user);
    return credential;
  };

  /** Resend verification email (if expired or not received) */
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
  };

  /** Reload user from Firebase to check if email was just verified */
  const reloadUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      // Force React state update
      setCurrentUser({ ...auth.currentUser });
    }
  };

  /** Password reset email */
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    reloadUser,
    resetPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
