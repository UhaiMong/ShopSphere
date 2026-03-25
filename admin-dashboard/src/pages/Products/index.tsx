import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Star, ImagePlus, X } from "lucide-react";
import { apiGet, apiPost, apiPut, apiPatch, api } from "@/services/api";
import {
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  Modal,
  ConfirmDialog,
  Pagination,
  PageHeader,
  SearchInput,
  SkeletonRow,
  EmptyState,
  Toggle,
} from "../../components/ui";
import { formatPrice, formatDate, truncate, cn } from "@/utils";
import type { Product, Category, PaginatedResponse } from "@/types";
import toast from "react-hot-toast";

// ─── Product Form
interface ProductForm {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: string;
  brand?: string;
  stock: number;
  sku?: string;
  tags?: string;
  isFeatured: boolean;
  isActive: boolean;
}

const ProductFormModal = ({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const isEdit = Boolean(product);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductForm>({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      price: product ? product.price / 100 : 0,
      comparePrice: product?.comparePrice
        ? product.comparePrice / 100
        : undefined,
      category:
        typeof product?.category === "object"
          ? product.category._id
          : (product?.category ?? ""),
      brand: product?.brand ?? "",
      stock: product?.stock ?? 0,
      sku: product?.sku ?? "",
      tags: product?.tags?.join(", ") ?? "",
      isFeatured: product?.isFeatured ?? false,
      isActive: product?.isActive ?? true,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("images", f));
    try {
      const { data } = await api.post<{ data: { images: string[] } }>(
        product ? `/products/${product._id}/images` : "/upload/images",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setImages((prev) => [...prev, ...(data.data?.images ?? [])]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    const payload = {
      ...data,
      price: Math.round(Number(data.price) * 100),
      comparePrice: data.comparePrice
        ? Math.round(Number(data.comparePrice) * 100)
        : undefined,
      stock: Number(data.stock),
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      images,
    };
    try {
      if (isEdit && product) {
        await apiPut(`/products/${product._id}`, payload);
        toast.success("Product updated");
      } else {
        await apiPost("/products", payload);
        toast.success("Product created");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed");
    }
  };

  return (
    <Modal
      isOpen
      title={isEdit ? "Edit Product" : "New Product"}
      onClose={onClose}
      size="xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Product Name *"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />
          </div>
          <Input
            label="Price (৳) *"
            type="number"
            step="0.01"
            error={errors.price?.message}
            hint="Enter in taka, e.g. 299.99"
            {...register("price", {
              required: "Price is required",
              min: { value: 0, message: "Price must be positive" },
            })}
          />
          <Input
            label="Compare Price (৳)"
            type="number"
            step="0.01"
            hint="Strike-through price"
            {...register("comparePrice")}
          />
          <Select
            label="Category *"
            error={errors.category?.message}
            options={[
              { value: "", label: "Select category" },
              ...categories.map((c) => ({ value: c._id, label: c.name })),
            ]}
            {...register("category", { required: "Category is required" })}
          />
          <Input label="Brand" {...register("brand")} />
          <Input
            label="Stock *"
            type="number"
            min="0"
            error={errors.stock?.message}
            {...register("stock", { required: true, min: 0 })}
          />
          <Input label="SKU" {...register("sku")} />
        </div>

        <Textarea
          label="Description *"
          error={errors.description?.message}
          {...register("description", { required: "Description is required" })}
        />
        <Input label="Short Description" {...register("shortDescription")} />
        <Input
          label="Tags (comma-separated)"
          placeholder="electronics, smartphone, 5g"
          {...register("tags")}
        />

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="accent-orange-500"
            />
            <span className="text-sm text-zinc-300">Featured</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register("isActive")}
              className="accent-orange-500"
            />
            <span className="text-sm text-zinc-300">Active</span>
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Images
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg border border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploading ? (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-4 h-4 text-zinc-600" />
                  <span className="text-[10px] text-zinc-600 mt-1">Add</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Products Table Page ──────────────────────────────────────────────────────
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
              <option key={c._id} value={c.slug}>
                {c.name}
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
                    typeof p.category === "object" ? p.category.name : "";
                  const isLow = p.stock > 0 && p.stock < 10;
                  const isOut = p.stock === 0;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                            {p.thumbnail && (
                              <img
                                src={p.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-200">
                              {truncate(p.name, 40)}
                            </p>
                            {p.brand && (
                              <p className="text-[10px] text-zinc-600">
                                {p.brand}
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
                          {formatPrice(p.price)}
                        </p>
                        {p.comparePrice && (
                          <p className="text-[10px] text-zinc-600 line-through">
                            {formatPrice(p.comparePrice)}
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
                          {p.stock} {isOut ? "· Out" : isLow ? "· Low" : ""}
                        </span>
                      </td>
                      <td>
                        <Badge color={p.isActive ? "green" : "red"}>
                          {p.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td>
                        <Toggle
                          checked={p.isFeatured}
                          onChange={(v) => void toggleFeatured(p._id, v)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setEditProduct(p)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDeleteId(p._id)}
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
