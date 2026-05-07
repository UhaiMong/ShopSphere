import { cn } from "@/utils";
import { forwardRef } from "react";

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...rest }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50",
          "hover:border-zinc-600 transition-colors",
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Select.displayName = "Select";
