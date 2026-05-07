import { cn } from "@/utils";
import { ReactNode } from "react";

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
