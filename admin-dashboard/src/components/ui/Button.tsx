import { cn } from "@/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Spinner } from "./Spinner";

// BUTTON
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "outline"
    | "success";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 active:scale-[0.97]";
const BTN_V = {
  primary: "bg-orange-500 text-white hover:bg-orange-600",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
  ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
  danger:
    "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  outline:
    "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800",
  success:
    "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20",
};
const BTN_S = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        BTN_BASE,
        BTN_V[variant],
        BTN_S[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <Spinner size="xs" className="text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = "Button";
