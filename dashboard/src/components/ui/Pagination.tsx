// PAGINATION

import { cn } from "@/utils";
import { Button } from "./Button";

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
