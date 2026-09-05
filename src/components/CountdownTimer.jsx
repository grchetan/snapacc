import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Clean Digital Countdown for Light Frost Theme.
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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold text-xs shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>Thawed & Ready</span>
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
    <div className={`flex items-baseline px-2 py-1 rounded-lg border shadow-sm ${
      highlight
        ? 'bg-white border-[#1E88E5] text-[#0D47A1]'
        : 'bg-white/90 border-blue-200 text-[#0A2558]'
    }`}>
      <span className={`font-bold tabular-nums ${highlight ? 'text-[#0D47A1]' : 'text-[#0A2558]'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-[#1E88E5] font-sans ml-1 font-semibold lowercase">
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
