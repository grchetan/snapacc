const TEST_DURATIONS = [
  { label: '1 min',  ms: 60 * 1000,        group: 'test' },
  { label: '2 min',  ms: 2 * 60 * 1000,    group: 'test' },
  { label: '5 min',  ms: 5 * 60 * 1000,    group: 'test' },
  { label: '10 min', ms: 10 * 60 * 1000,   group: 'test' },
  { label: '30 min', ms: 30 * 60 * 1000,   group: 'test' },
  { label: '1 hour', ms: 60 * 60 * 1000,   group: 'test' },
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

export const ALL_DURATIONS = [...TEST_DURATIONS, ...REAL_DURATIONS];

export default function DurationPicker({ value, onChange }) {
  return (
    <div className="space-y-4">
      {/* Test durations */}
      <div>
        <p className="text-xs font-medium text-vault-muted mb-2 flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            TEST
          </span>
          For testing only
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TEST_DURATIONS.map((d) => (
            <DurationButton key={d.label} duration={d} selected={value === d.ms} onSelect={onChange} />
          ))}
        </div>
      </div>

      <div className="border-t border-vault-border" />

      {/* Real durations */}
      <div>
        <p className="text-xs font-medium text-vault-muted mb-2 flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-bold">
            REAL
          </span>
          Lock durations
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {REAL_DURATIONS.map((d) => (
            <DurationButton key={d.label} duration={d} selected={value === d.ms} onSelect={onChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DurationButton({ duration, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(duration.ms, duration.label)}
      className={`
        py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 border
        ${selected
          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
          : 'bg-vault-surface border-vault-border text-vault-muted hover:border-amber-500/30 hover:text-vault-text'
        }
      `}
    >
      {duration.label}
    </button>
  );
}
