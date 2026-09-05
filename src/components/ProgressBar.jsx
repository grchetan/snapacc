import { useState, useEffect } from 'react';

/**
 * Modern slim progress bar with live percentage.
 */
export default function ProgressBar({ createdAt, unlockTime }) {
  const [percentage, setPercentage] = useState(() => calcPercent(createdAt, unlockTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage(calcPercent(createdAt, unlockTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, unlockTime]);

  const rounded = Math.round(percentage);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex justify-between items-center text-[11px] text-zinc-400">
        <span className="font-medium tracking-wide">Duration Elapsed</span>
        <span className="font-mono tabular-nums text-zinc-300 font-semibold">{rounded}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            background: percentage >= 100
              ? '#10b981'
              : 'linear-gradient(90deg, #d97706, #f59e0b)',
          }}
        />
      </div>
    </div>
  );
}

function calcPercent(createdAt, unlockTime) {
  const total   = unlockTime - createdAt;
  const elapsed = Math.min(Date.now() - createdAt, total);
  return total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
}
