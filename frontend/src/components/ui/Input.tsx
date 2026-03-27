import { cn } from "@/utils/cn";
import { forwardRef, ReactNode } from "react";

// INPUT
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-2.5 text-sm rounded-xl border bg-white transition-colors",
              "placeholder:text-stone-400 text-stone-900",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              error
                ? "border-red-300 focus:ring-red-400"
                : "border-stone-200 hover:border-stone-300",
              //   leftIcon && "pl-9",
              //   rightIcon && "pr-9",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
