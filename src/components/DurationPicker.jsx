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
      {/* Standard Commitments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Standard Durations</span>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
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
      <div className="pt-2 border-t border-zinc-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500">Short Duration (Testing)</span>
          <span className="text-[10px] uppercase font-semibold text-amber-500/70 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
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
        py-2 px-2.5 rounded-xl text-xs font-medium transition-all border text-center
        ${selected
          ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-sm shadow-amber-500/10'
          : isTest
            ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
        }
      `}
    >
      {duration.label}
    </button>
  );
}
