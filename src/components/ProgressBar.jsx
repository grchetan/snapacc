import { useState, useEffect } from 'react';

/**
 * Cryo Thawing Progress Bar with Ice-Blue Gradient.
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
      <div className="flex justify-between items-center text-[11px] text-[#90CAF9]/80">
        <span className="font-medium tracking-wide">Thaw Progress</span>
        <span className="font-mono tabular-nums text-[#E3F2FD] font-semibold">{rounded}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#07172e] rounded-full overflow-hidden border border-[#90CAF9]/15">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(33,150,243,0.5)]"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            background: percentage >= 100
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #0D47A1, #2196F3, #90CAF9)',
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
