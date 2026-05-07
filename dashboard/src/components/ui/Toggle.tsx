import { cn } from "@/utils";

// TOGGLE SWITCH
export const Toggle = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={cn(
      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50",
      checked ? "bg-orange-500" : "bg-zinc-700",
    )}
  >
    <span
      className={cn(
        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-4.5" : "translate-x-0.5",
      )}
    />
  </button>
);
