import { useState, useEffect } from 'react';

/**
 * Live progress bar — updates every second.
 * Shows how much of the lock duration has elapsed.
 */
export default function ProgressBar({ createdAt, unlockTime }) {
  const [percentage, setPercentage] = useState(() => calcPercent(createdAt, unlockTime));

  useEffect(() => {
    // Update every second so bar moves smoothly with the countdown
    const interval = setInterval(() => {
      setPercentage(calcPercent(createdAt, unlockTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, unlockTime]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-vault-muted">
        <span>Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 bg-vault-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${percentage}%`,
            background: percentage >= 100
              ? '#10b981'
              : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
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
