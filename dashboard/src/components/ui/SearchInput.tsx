import { X } from "lucide-react";

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
