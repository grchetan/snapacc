import { useState, useEffect } from 'react';

/**
 * Clean Progress Bar for Light Frost Theme.
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
      <div className="flex justify-between items-center text-[11px] text-[#1E4E8C]">
        <span className="font-semibold tracking-wide">Thaw Progress</span>
        <span className="font-mono tabular-nums text-[#0D47A1] font-bold">{rounded}%</span>
      </div>
      <div className="h-2 w-full bg-blue-100/90 rounded-full overflow-hidden border border-blue-200">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear shadow-sm"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            background: percentage >= 100
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #1E88E5, #0D47A1)',
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
