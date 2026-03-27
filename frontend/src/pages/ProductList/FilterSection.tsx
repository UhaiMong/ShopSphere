import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Filter Accordion Section
export const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-stone-800 mb-0"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};
