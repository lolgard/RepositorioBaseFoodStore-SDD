interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function TimeRangeSelector({ value, onChange }: Props) {
  const options = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ];

  return (
    <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
      {options.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
            value === r.value 
            ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]' 
            : 'text-surface-custom-500 hover:text-white'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
