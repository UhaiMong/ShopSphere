import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductFilters } from "@/types/typeFilter";
import { Category } from "@/types/typeCategory";
import { FilterSection } from "./FilterSection";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

// Filters Panel
export const FiltersPanel = ({
  filters,
  categories,
  onChange,
  onReset,
}: {
  filters: ProductFilters;
  categories: Category[];
  onChange: (partial: Partial<ProductFilters>) => void;
  onReset: () => void;
}) => {
  const rootCats = categories.filter((c) => !c.parent && c.isActive);
  const [priceMin, setPriceMin] = useState(
    String((filters.minPrice ?? 0) / 100),
  );
  const [priceMax, setPriceMax] = useState(
    String((filters.maxPrice ?? 0) / 100),
  );

  const applyPrice = () => {
    onChange({
      minPrice: priceMin ? Math.round(parseFloat(priceMin) * 100) : undefined,
      maxPrice: priceMax ? Math.round(parseFloat(priceMax) * 100) : undefined,
    });
  };

  const hasActiveFilters =
    filters.category || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-brand-600 hover:underline"
            >
              Reset all
            </button>
          )}
        </div>

        {/* Categories */}
        <FilterSection title="Category">
          <div className="space-y-1">
            <button
              onClick={() => onChange({ category: undefined })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                !filters.category
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50",
              )}
            >
              All Categories
            </button>
            {rootCats.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onChange({ category: cat.slug, page: 1 })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                  filters.category === cat.slug
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-stone-600 hover:bg-stone-50",
                )}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                  ৳
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-stone-400 text-xs">to</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                  ৳
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={applyPrice}>
              Apply
            </Button>
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" defaultOpen>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              onChange={(e) =>
                onChange({ inStock: e.target.checked || undefined, page: 1 })
              }
              className="w-4 h-4 rounded accent-brand-500"
            />
            <span className="text-sm text-stone-700">In stock only</span>
          </label>
        </FilterSection>
      </div>
    </aside>
  );
};
