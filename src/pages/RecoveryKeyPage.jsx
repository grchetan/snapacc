import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecoveryKeyModal from '../components/RecoveryKeyModal';

export default function RecoveryKeyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // Guard: if someone navigates here directly without state, redirect home
  useEffect(() => {
    if (!state?.masterKey) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.masterKey) return null;

  const handleClose = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-vault-bg">
      <Navbar />
      {/* Full-screen modal on top of a dimmed vault page */}
      <RecoveryKeyModal
        masterKey={state.masterKey}
        unlockTime={state.unlockTime}
        label={state.label}
        onClose={handleClose}
      />
    </div>
  );
}
