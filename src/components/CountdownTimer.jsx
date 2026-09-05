import { useState, useEffect } from 'react';

/**
 * Live countdown timer that ticks every second.
 * @param {number} unlockTime  Unix timestamp (ms) when vault opens
 * @param {function} onExpired Called when timer reaches zero
 */
export default function CountdownTimer({ unlockTime, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(unlockTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft(unlockTime);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockTime, onExpired]);

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-vault-green font-medium text-sm">
        <span className="w-2 h-2 rounded-full bg-vault-green animate-pulse inline-block" />
        Unlocked
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      {days > 0 && (
        <>
          <TimeUnit value={days} label="d" />
          <span className="text-vault-muted">:</span>
        </>
      )}
      <TimeUnit value={hours} label="h" />
      <span className="text-vault-muted">:</span>
      <TimeUnit value={minutes} label="m" />
      <span className="text-vault-muted">:</span>
      <TimeUnit value={seconds} label="s" />
    </div>
  );
}

function TimeUnit({ value, label }) {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className="text-amber-400 font-bold tabular-nums w-6 text-right">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-vault-muted text-xs">{label}</span>
    </span>
  );
}

function getTimeLeft(unlockTime) {
  const total = Math.max(0, unlockTime - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);
  return { total, days, hours, minutes, seconds };
}
