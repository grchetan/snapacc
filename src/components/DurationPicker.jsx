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
          <span className="text-xs font-semibold text-[#90CAF9] uppercase tracking-wider">
            Freeze Durations
          </span>
          <span className="text-[10px] font-semibold text-[#90CAF9] bg-[#0D47A1]/30 border border-[#90CAF9]/25 px-2 py-0.5 rounded-full">
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
      <div className="pt-3 border-t border-[#90CAF9]/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#90CAF9]/70">
            Quick Test (Minutes)
          </span>
          <span className="text-[10px] font-semibold text-[#90CAF9]/70 bg-[#07172e] border border-[#90CAF9]/15 px-1.5 py-0.5 rounded">
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
        py-2.5 px-2 rounded-xl text-xs font-medium transition-all text-center border backdrop-blur-md
        ${selected
          ? 'bg-gradient-to-r from-[#1E88E5] to-[#2196F3] text-[#E3F2FD] font-bold border-[#90CAF9] shadow-[0_0_15px_rgba(33,150,243,0.35)] scale-[1.02]'
          : isTest
            ? 'bg-[#050f21]/70 border-[#90CAF9]/15 text-[#90CAF9]/70 hover:border-[#90CAF9]/35 hover:text-[#E3F2FD]'
            : 'bg-[#0c1d38]/60 border-[#90CAF9]/20 text-[#90CAF9] hover:border-[#90CAF9]/40 hover:text-[#E3F2FD]'
        }
      `}
    >
      {duration.label}
    </button>
  );
}
