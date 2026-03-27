// SPINNER

import { cn } from "@/utils";

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
