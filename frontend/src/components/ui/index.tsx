import { cn, getStarArray } from "@/uitls";
import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
// import { cn, getStarArray } from "../../utils";

// ═══════════════════════════════════════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════════
interface BadgeProps {
  children: ReactNode;
  variant?: "brand" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

const BADGE_VARIANTS = {
  brand: "bg-brand-50 text-brand-700 border border-brand-200",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  neutral: "bg-stone-100 text-stone-600 border border-stone-200",
};

export const Badge = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center font-medium rounded-full",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      BADGE_VARIANTS[variant],
      className,
    )}
  >
    {children}
  </span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════════════════════════════════════════
interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SPINNER_SIZES = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const Spinner = ({ size = "md", className }: SpinnerProps) => (
  <svg
    className={cn(
      "animate-spin shrink-0",
      SPINNER_SIZES[size],
      className ?? "text-brand-500",
    )}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// STAR RATING
// ═══════════════════════════════════════════════════════════════════════════════
interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export const StarRating = ({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
}: StarRatingProps) => {
  const stars = getStarArray(rating);
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((fill, i) => (
          <svg
            key={i}
            className={cn(
              starSize,
              fill > 0 ? "text-amber-400" : "text-stone-200",
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {fill === 0.5 ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#e7e5e4" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </>
            ) : (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-stone-500">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════════
export const SkeletonProductCard = () => (
  <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white">
    <div className="skeleton aspect-square w-full" />
    <div className="p-4 space-y-2.5">
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("skeleton rounded", className)} />
);

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="mb-4 text-stone-300">{icon}</div>}
    <h3 className="text-lg font-semibold text-stone-800 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-stone-500 max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTITY SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════
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
    <span className="px-4 py-2 text-sm font-medium text-stone-900 min-w-[3rem] text-center border-x border-stone-200">
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
