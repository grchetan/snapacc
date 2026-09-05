import { useState, useEffect } from 'react';

/**
 * High-legibility countdown timer.
 * Clean, modern layout without loud borders.
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
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Ready to decrypt
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm">
      {days > 0 && (
        <TimeUnit value={days} unit="d" />
      )}
      <TimeUnit value={hours} unit="h" />
      <TimeUnit value={minutes} unit="m" />
      <TimeUnit value={seconds} unit="s" highlight />
    </div>
  );
}

function TimeUnit({ value, unit, highlight = false }) {
  return (
    <div className="flex items-baseline bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded-md">
      <span className={`font-semibold tabular-nums ${highlight ? 'text-amber-400' : 'text-zinc-200'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-zinc-500 font-sans ml-1 font-medium lowercase">
        {unit}
      </span>
    </div>
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
