import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
// import api from '../../services/api';
import type { Category, ProductFilters } from "../../types";
import { useDebounce } from "../../hooks";
import { useProducts } from "../../hooks";
import { ProductCard } from "../../components/shared/ProductCard";
import { SkeletonProductCard, Button, EmptyState } from "../../components/ui";
import { cn } from "@/uitls";
import api from "@/services/app";
// import { cn, formatPrice } from '../../utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

// ─── Filter Accordion Section ─────────────────────────────────────────────────
const FilterSection = ({
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

// ─── Filters Panel ────────────────────────────────────────────────────────────
const FiltersPanel = ({
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

// ─── Product List Page ────────────────────────────────────────────────────────
export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 450);

  // Build filters from URL
  const filters: ProductFilters = {
    page: Number(searchParams.get("page") ?? 1),
    limit: 20,
    category: searchParams.get("category") ?? undefined,
    sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? "newest",
    search: debouncedSearch || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    isFeatured: searchParams.get("isFeatured") === "true" ? true : undefined,
  };

  const { data, isLoading } = useProducts(filters);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  // Load categories once
  useEffect(() => {
    void api
      .get<{ data: Category[] }>("/categories")
      .then(({ data: d }) => setCategories(d.data));
  }, []);

  // Sync debounced search to URL
  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) {
      updateFilters({ search: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const updateFilters = useCallback(
    (partial: Partial<ProductFilters>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(partial).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") next.delete(k);
        else next.set(k, String(v));
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput("");
  };

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <div className="container-app py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1
          style={{ fontFamily: "Syne, sans-serif" }}
          className="text-2xl font-bold text-stone-900"
        >
          {filters.search
            ? `Results for "${filters.search}"`
            : filters.category
              ? (categories.find((c) => c.slug === filters.category)?.name ??
                "Products")
              : filters.isFeatured
                ? "Featured Products"
                : "All Products"}
        </h1>
        {pagination && (
          <p className="text-sm text-stone-400 mt-1">
            {pagination.total.toLocaleString()} products found
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) =>
            updateFilters({
              sort: e.target.value as ProductFilters["sort"],
              page: 1,
            })
          }
          className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer text-stone-700"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-stone-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <FiltersPanel
            filters={filters}
            categories={categories}
            onChange={updateFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title="No products found"
              description="Try adjusting your search or filters"
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
                {products.map((p: any, i: any) => (
                  <div
                    key={p._id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${(i % 12) * 40}ms` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => updateFilters({ page: filters.page! - 1 })}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 7) },
                      (_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            onClick={() => updateFilters({ page: p })}
                            className={cn(
                              "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                              filters.page === p
                                ? "bg-brand-500 text-white"
                                : "text-stone-600 hover:bg-stone-100",
                            )}
                          >
                            {p}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => updateFilters({ page: filters.page! + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-stone-950/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <FiltersPanel
              filters={filters}
              categories={categories}
              onChange={(p) => {
                updateFilters(p);
                setShowMobileFilters(false);
              }}
              onReset={() => {
                resetFilters();
                setShowMobileFilters(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
