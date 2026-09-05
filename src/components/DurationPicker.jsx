const TEST_DURATIONS = [
  { label: '1 min',  ms: 60 * 1000 },
  { label: '2 min',  ms: 2 * 60 * 1000 },
  { label: '5 min',  ms: 5 * 60 * 1000 },
  { label: '10 min', ms: 10 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
];

const REAL_DURATIONS = [
  { label: '1 day',    ms: 1  * 24 * 60 * 60 * 1000 },
  { label: '2 days',   ms: 2  * 24 * 60 * 60 * 1000 },
  { label: '3 days',   ms: 3  * 24 * 60 * 60 * 1000 },
  { label: '4 days',   ms: 4  * 24 * 60 * 60 * 1000 },
  { label: '5 days',   ms: 5  * 24 * 60 * 60 * 1000 },
  { label: '1 week',   ms: 7  * 24 * 60 * 60 * 1000 },
  { label: '2 weeks',  ms: 14 * 24 * 60 * 60 * 1000 },
  { label: '30 days',  ms: 30 * 24 * 60 * 60 * 1000 },
  { label: '60 days',  ms: 60 * 24 * 60 * 60 * 1000 },
  { label: '90 days',  ms: 90 * 24 * 60 * 60 * 1000 },
  { label: '180 days', ms: 180 * 24 * 60 * 60 * 1000 },
  { label: '1 year',   ms: 365 * 24 * 60 * 60 * 1000 },
];

export default function DurationPicker({ value, onChange }) {
  return (
    <div className="space-y-4">
      {/* Standard Freeze Commitments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">
            Standard Locks
          </span>
          <span className="text-[10px] font-bold text-[#0D47A1] bg-[#E3F2FD] border border-[#90CAF9] px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {REAL_DURATIONS.map((d) => (
            <DurationButton
              key={d.label}
              duration={d}
              selected={value === d.ms}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>

      {/* Quick Test Durations */}
      <div className="pt-3 border-t border-blue-200/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#1E4E8C]">
            Quick Test (Minutes)
          </span>
          <span className="text-[10px] font-semibold text-[#1E4E8C] bg-white border border-blue-200 px-1.5 py-0.5 rounded">
            Test
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TEST_DURATIONS.map((d) => (
            <DurationButton
              key={d.label}
              duration={d}
              selected={value === d.ms}
              onSelect={onChange}
              isTest
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DurationButton({ duration, selected, onSelect, isTest = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(duration.ms, duration.label)}
      className={`
        py-2.5 px-2 rounded-xl text-xs font-semibold transition-all text-center border shadow-sm
        ${selected
          ? 'bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white font-bold border-[#0D47A1] shadow-md shadow-blue-500/20 scale-[1.02]'
          : isTest
            ? 'bg-white/60 border-blue-200 text-[#1E4E8C] hover:bg-white hover:border-[#1E88E5]'
            : 'bg-white/85 border-blue-200/90 text-[#0D47A1] hover:bg-white hover:border-[#1E88E5]'
        }
      `}
    >
      {duration.label}
    </button>
  );
}
