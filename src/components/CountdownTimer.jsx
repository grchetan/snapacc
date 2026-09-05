import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Cold Ice Digital Countdown Timer.
 * Styled with crisp icy-blue digital units and soft frosty glows.
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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-medium text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)]">
        <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
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
    <div className={`flex items-baseline px-2 py-1 rounded-lg border backdrop-blur-md shadow-sm ${
      highlight
        ? 'bg-[#0c2244]/90 border-[#90CAF9]/40 shadow-[0_0_10px_rgba(33,150,243,0.2)]'
        : 'bg-[#07172e]/80 border-[#90CAF9]/20'
    }`}>
      <span className={`font-bold tabular-nums ${highlight ? 'text-[#90CAF9]' : 'text-[#E3F2FD]'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-[#90CAF9]/70 font-sans ml-1 font-medium lowercase">
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
