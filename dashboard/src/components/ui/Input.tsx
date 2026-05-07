import { cn } from "@/utils";
import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

// INPUT
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, className, id, ...rest },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-3 py-2 text-sm bg-zinc-900 border rounded-lg text-zinc-100 placeholder:text-zinc-600 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50",
              error
                ? "border-red-500/50"
                : "border-zinc-700 hover:border-zinc-600",
              (leftIcon as any) && "pl-9",
              (rightIcon as any) && "pr-9",
              className,
            )}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-zinc-600">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
