import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';
import { X, Shield, KeyRound, User, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'profile'
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd]                 = useState(false);
  const [pwdLoading, setPwdLoading]           = useState(false);
  const [pwdSuccess, setPwdSuccess]           = useState(false);
  const [pwdError, setPwdError]               = useState(null);

  // Profile state
  const [displayName, setDisplayName]         = useState(currentUser?.displayName || '');
  const [profLoading, setProfLoading]         = useState(false);
  const [profSuccess, setProfSuccess]         = useState(false);
  const [profError, setProfError]             = useState(null);

  if (!isOpen) return null;

  const isPasswordUser = currentUser?.providerData?.some(p => p.providerId === 'password');

  // Handle password update with re-authentication
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters.');
      return;
    }

    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(false);

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);
      setPwdSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(false), 4000);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPwdError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setPwdError('New password is too weak.');
      } else {
        setPwdError(err.message || 'Failed to update password.');
      }
    } finally {
      setPwdLoading(false);
    }
  };

  // Handle profile display name update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    setProfError(null);
    setProfSuccess(false);

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      setProfSuccess(true);
      setTimeout(() => setProfSuccess(false), 3000);
    } catch (err) {
      setProfError(err.message || 'Failed to update profile.');
    } finally {
      setProfLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white/95 rounded-3xl border border-white/80 shadow-[0_15px_45px_rgba(13,71,161,0.18)] backdrop-blur-2xl overflow-hidden relative text-[#0A2558]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-[#F0F7FF]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] border border-[#90CAF9] flex items-center justify-center text-[#0D47A1]">
              <Shield className="w-4 h-4 text-[#1E88E5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#0A2558]">Account Security</h2>
              <p className="text-[11px] text-[#1E4E8C] font-medium">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-[#0A2558] hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 pt-4 gap-2 border-b border-blue-100">
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'password'
                ? 'border-[#1E88E5] text-[#0D47A1]'
                : 'border-transparent text-[#1E4E8C] hover:text-[#0A2558]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#1E88E5] text-[#0D47A1]'
                : 'border-transparent text-[#1E4E8C] hover:text-[#0A2558]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ── Tab 1: Password ── */}
          {activeTab === 'password' && (
            <div>
              {!isPasswordUser ? (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-[#1E4E8C]">
                  <p className="font-semibold text-[#0D47A1] mb-1">Google Signed-In Account</p>
                  <p>You log in using Google OAuth. Password change is handled directly by your Google account.</p>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F0F7FF] border border-blue-200 text-xs sm:text-sm text-[#0A2558] outline-none focus:border-[#1E88E5]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPwd(p => !p)}
                        className="text-xs text-[#1E88E5] font-semibold flex items-center gap-1"
                      >
                        {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPwd ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F0F7FF] border border-blue-200 text-xs sm:text-sm text-[#0A2558] outline-none focus:border-[#1E88E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F0F7FF] border border-blue-200 text-xs sm:text-sm text-[#0A2558] outline-none focus:border-[#1E88E5]"
                    />
                  </div>

                  {pwdError && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{pwdError}</span>
                    </div>
                  )}

                  {pwdSuccess && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Password updated successfully!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {pwdLoading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Tab 2: Profile ── */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Chetan"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F0F7FF] border border-blue-200 text-xs sm:text-sm text-[#0A2558] outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-[#1E4E8C] mt-1 font-medium">
                  Email verification status: {currentUser?.emailVerified ? 'Verified ✅' : 'Pending'}
                </p>
              </div>

              {profError && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{profError}</span>
                </div>
              )}

              {profSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Profile updated!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={profLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {profLoading ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
