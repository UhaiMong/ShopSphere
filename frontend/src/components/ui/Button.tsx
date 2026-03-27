// import { cn, getStarArray } from "@/utils";
// import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Spinner } from "./Spinner";

// BUTTON
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.97]";

const BUTTON_VARIANTS = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-brand-500/25 hover:shadow-md",
  secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200",
  ghost: "text-stone-700 hover:bg-stone-100 hover:text-stone-900",
  danger: "bg-red-500 text-white hover:bg-red-600",
  outline:
    "border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50",
};

const BUTTON_SIZES = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = "Button";
