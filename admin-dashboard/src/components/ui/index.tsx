import {
  forwardRef,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { X, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils";

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

// BADGE
const BADGE_V: Record<string, string> = {
  orange: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  red: "bg-red-500/10 text-red-400 border border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  zinc: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
  purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
};

export const Badge = ({
  children,
  color = "zinc",
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
      BADGE_V[color] ?? BADGE_V.zinc,
      className,
    )}
  >
    {children}
  </span>
);

// SPINNER

const SP_S = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };
export const Spinner = ({
  size = "md",
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) => (
  <svg
    className={cn(
      "animate-spin shrink-0",
      SP_S[size],
      className ?? "text-orange-500",
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

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...rest }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={cn(
          "w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors hover:border-zinc-600",
          className,
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";

// STAT CARD
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  sub?: string;
  color?: "orange" | "green" | "blue" | "purple";
}
const STAT_COLORS = {
  orange: "bg-orange-500/10 text-orange-500",
  green: "bg-emerald-500/10 text-emerald-500",
  blue: "bg-blue-500/10 text-blue-500",
  purple: "bg-purple-500/10 text-purple-500",
};
export const StatCard = ({
  label,
  value,
  icon,
  trend,
  sub,
  color = "orange",
}: StatCardProps) => (
  <div className="card p-5 animate-fade-up">
    <div className="flex items-start justify-between mb-4">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          STAT_COLORS[color],
        )}
      >
        {icon}
      </div>
      {trend !== undefined && (
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend >= 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400",
          )}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-zinc-100 mb-0.5">{value}</p>
    <p className="text-xs text-zinc-500">{label}</p>
    {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
  </div>
);

// MODAL
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}
const MODAL_SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl animate-fade-up",
          MODAL_SIZES[size],
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// CONFIRM DIALOG

interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading,
}: ConfirmProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-zinc-400 mb-5">{description}</p>
    <div className="flex gap-2 justify-end">
      <Button variant="outline" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="danger"
        size="sm"
        isLoading={isLoading}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

// TABLE SORT ICON
export const SortIcon = ({
  direction,
}: {
  direction?: "asc" | "desc" | false;
}) => {
  if (direction === "asc")
    return <ChevronUp className="w-3.5 h-3.5 text-orange-400" />;
  if (direction === "desc")
    return <ChevronDown className="w-3.5 h-3.5 text-orange-400" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-600" />;
};

// PAGINATION

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}
export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: PaginationProps) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Array.from(
    { length: Math.min(totalPages, 7) },
    (_, i) => i + 1,
  );
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
      <span className="text-xs text-zinc-500">
        {from}–{to} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ←
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "w-7 h-7 rounded-lg text-xs font-medium transition-colors",
              p === page
                ? "bg-orange-500 text-white"
                : "text-zinc-400 hover:bg-zinc-800",
            )}
          >
            {p}
          </button>
        ))}
        {totalPages > 7 && (
          <span className="text-zinc-600 text-xs px-1">…{totalPages}</span>
        )}
        <Button
          variant="ghost"
          size="xs"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          →
        </Button>
      </div>
    </div>
  );
};

// EMPTY STATE
export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 text-zinc-700">{icon}</div>}
    <p className="font-medium text-zinc-400">{title}</p>
    {description && (
      <p className="text-xs text-zinc-600 mt-1 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// SKELETON

export const SkeletonRow = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

// PAGE HEADER

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 className="text-xl font-bold text-zinc-100">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

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

// Search input
export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-4 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 w-60 hover:border-zinc-600 transition-colors"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
