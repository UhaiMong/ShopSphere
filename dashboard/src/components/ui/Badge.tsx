import { cn } from "@/utils";
import { ReactNode } from "react";

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
