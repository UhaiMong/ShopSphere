import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiGet, apiPut, apiPatch, api } from "@/services/api";
import { formatPrice, truncate, cn } from "@/utils";
import type { Product, Category, PaginatedResponse } from "@/types";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState, SkeletonRow } from "@/components/ui/SkeletonRow";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Pagination } from "@/components/ui/Pagination";
import { ProductFormModal } from "./ProductFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Products Table Page
export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 20 };
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;
        if (stockFilter === "low") {
          params.maxStock = 10;
          params.minStock = 1;
        }
        if (stockFilter === "out") params.inStock = false;

        const res = await apiGet<PaginatedResponse<Product>>(
          `/products?${new URLSearchParams(params as any)}`,
        );
        setProducts((res as any).data ?? []);
        setPagination(
          (res as any).pagination ?? {
            page: 1,
            totalPages: 1,
            total: 0,
            limit: 20,
          },
        );
      } finally {
        setIsLoading(false);
      }
    },
    [search, categoryFilter, stockFilter],
  );

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void apiGet<{ data: Category[] }>("/categories").then((r) =>
      setCategories((r as any).data ?? []),
    );
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiPatch(`/products/${deleteId}/stock`, {}); // soft delete via isActive
      await api.delete(`/products/${deleteId}`);
      toast.success("Product deleted");
      void load(pagination.page);
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleFeatured = async (id: string, val: boolean) => {
    await apiPut(`/products/${id}`, { isFeatured: val });
    setProducts((p) =>
      p.map((prod) => (prod._id === id ? { ...prod, isFeatured: val } : prod)),
    );
  };

  console.log("Products of all: ", products);

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${pagination.total} total`}
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setEditProduct(null)}
          >
            New Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
          }}
          placeholder="Search products..."
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories
            .filter((c) => !c.parent)
            .map((c) => (
              <option key={c._id} value={c?.slug}>
                {c?.name}
              </option>
            ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none"
        >
          <option value="">All Stock</option>
          <option value="low">Low Stock (&lt;10)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No products found" />
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const catName =
                    typeof p?.category === "object" ? p?.category?.name : "";
                  const isLow = p?.stock > 0 && p?.stock < 10;
                  const isOut = p?.stock === 0;
                  return (
                    <tr key={p?._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                            {p?.thumbnail && (
                              <img
                                src={p?.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-200">
                              {truncate(p?.name, 40)}
                            </p>
                            {p?.brand && (
                              <p className="text-[10px] text-zinc-600">
                                {p?.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge color="zinc">{catName || "—"}</Badge>
                      </td>
                      <td>
                        <p className="text-xs font-medium text-zinc-200">
                          {formatPrice(p?.price)}
                        </p>
                        {p?.comparePrice && (
                          <p className="text-[10px] text-zinc-600 line-through">
                            {formatPrice(p?.comparePrice)}
                          </p>
                        )}
                      </td>
                      <td>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isOut
                              ? "text-red-400"
                              : isLow
                                ? "text-amber-400"
                                : "text-zinc-300",
                          )}
                        >
                          {p?.stock} {isOut ? "· Out" : isLow ? "· Low" : ""}
                        </span>
                      </td>
                      <td>
                        <Badge color={p?.isActive ? "green" : "red"}>
                          {p?.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td>
                        <Toggle
                          checked={p?.isFeatured}
                          onChange={(v) => void toggleFeatured(p?._id, v)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {/* Edit product */}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setEditProduct(p)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {/* Delete product */}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDeleteId(p?._id)}
                            className="text-red-400 hover:bg-red-500/5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={(p) => void load(p)}
          />
        )}
      </div>

      {/* Modals */}

      {editProduct !== undefined && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(undefined)}
          onSaved={() => void load(pagination.page)}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Product"
        description="This will hide the product from the storefront. This action cannot be undone."
        confirmLabel="Delete Product"
      />
    </div>
  );
};
