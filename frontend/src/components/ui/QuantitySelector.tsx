// QUANTITY SELECTOR
interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export const QuantitySelector = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
}: QuantitySelectorProps) => (
  <div className="flex items-center gap-0 rounded-xl border border-stone-200 overflow-hidden w-fit">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={disabled || value <= min}
      className="px-3 py-2 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg leading-none"
    >
      −
    </button>
    <span className="px-4 py-2 text-sm font-medium text-stone-900 min-w-12 text-center border-x border-stone-200">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={disabled || value >= max}
      className="px-3 py-2 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg leading-none"
    >
      +
    </button>
  </div>
);
