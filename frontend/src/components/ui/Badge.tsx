import { cn } from "@/utils/cn";
import { ReactNode } from "react";

// BADGE
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
