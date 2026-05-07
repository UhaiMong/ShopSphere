import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ImageOff,
  Copy,
  Check,
} from "lucide-react";
import { apiGet, apiPut, apiDelete } from "@/services/api";
import toast from "react-hot-toast";
import { truncate, fSizeExtension } from "@/utils";
import type { Category, PaginatedResponse, Media } from "@/types";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toggle } from "@/components/ui/Toggle";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRow } from "@/components/ui/SkeletonRow";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MediaFormModal } from "./MediaFormModal";

// Media Table Page
export const MediaPage = () => {
  type MediaCategory = Pick<Category, "_id" | "name" | "slug">;
  type MediaViewItem = Omit<Media, "category"> & {
    __v?: number;
    category?: string | MediaCategory | null;
  };

  const [media, setMedia] = useState<Media[]>([]);
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
  const [editMedia, setEditMedia] = useState<Media | null | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMedia, setViewMedia] = useState<MediaViewItem | null>(null);
  const [isView, setView] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const load = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 20 };
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;

        const res = await apiGet<PaginatedResponse<Media>>(
          `/media?${new URLSearchParams(params as any)}`,
        );
        setMedia((res as any).data ?? []);
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

  //   Media view handler

  const handleMediaView = (media: MediaViewItem) => {
    setViewMedia(media);
    setView(true);
  };

  const handleCloseView = () => {
    setView(false);
    setViewMedia(null);
    setCopiedField(null);
  };

  const handleCopy = async (value: string, field: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1500);
      toast.success(`${field} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const categoryMeta =
    typeof viewMedia?.category === "object" && viewMedia?.category
      ? viewMedia.category
      : (categories.find((c) => c._id === viewMedia?.category) ?? null);

  const mediaDetails = viewMedia
    ? [
        { label: "Title", value: viewMedia.title || "Not provided" },
        {
          label: "URL",
          value: viewMedia.imgURL || "Not available",
          field: "URL",
        },
        { label: "Alt text", value: viewMedia.alt || "Not provided" },
        {
          label: "File size",
          value: viewMedia.fileSize
            ? fSizeExtension(viewMedia.fileSize)
            : "Unknown",
        },
        {
          label: "Version",
          value:
            typeof viewMedia.__v === "number"
              ? String(viewMedia.__v)
              : "Not available",
        },
      ]
    : [];

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/media/${deleteId}`);
      toast.success("Media product image deleted!");
      void load(pagination.page);
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };
  const toggleActiveStatus = async (id: string, val: boolean) => {
    if (val) {
      await apiPut(`/media/${id}/restore`, { isActive: val });
    } else {
      await apiPut(`/media/${id}/trash`, { isAtive: val });
    }

    setMedia((p) =>
      p.map((prod) => (prod._id === id ? { ...prod, isActive: val } : prod)),
    );
  };

  return (
    <AnimatePresence>
      <div>
        <PageHeader
          title="Media"
          subtitle={`${pagination.total} total`}
          actions={
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setEditMedia(null)}
            >
              New Media
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
        </div>

        {/* Table */}
        <div
          className={`${isView ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}
        >
          <div className="card overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Size</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} cols={7} />
                    ))
                  ) : media.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState title="No media found" />
                      </td>
                    </tr>
                  ) : (
                    media.map((p) => {
                      return (
                        <tr key={p._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                                {p.imgURL && (
                                  <img
                                    src={
                                      Array.isArray(p.imgURL)
                                        ? p.imgURL[0]
                                        : p.imgURL
                                    }
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-text-muted">
                                  {truncate(p.alt, 40)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-xs font-medium text-zinc-200">
                              {p.title}
                            </p>
                          </td>
                          <td>{fSizeExtension(p.fileSize)}</td>
                          <td>
                            {truncate(
                              Array.isArray(p.imgURL) ? p.imgURL[0] : p.imgURL,
                              40,
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(String(p.imgURL), String(p.imgURL))
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-200"
                            >
                              {copiedField === p.imgURL ? (
                                <>
                                  <Check size={12} />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  Copy
                                </>
                              )}
                            </button>
                          </td>

                          <td>
                            <Toggle
                              checked={p.isActive}
                              onChange={(v) =>
                                void toggleActiveStatus(p._id, v)
                              }
                            />
                          </td>

                          <td>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  handleMediaView(p as MediaViewItem)
                                }
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setEditMedia(p as any)}
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
          {/* Media View */}
          {isView && (
            <motion.aside
              key="detail"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="card h-fit overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <p className="text-xs text-zinc-500">Preview and metadata</p>
                <button
                  type="button"
                  onClick={handleCloseView}
                  className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  {viewMedia?.imgURL ? (
                    <img
                      src={
                        Array.isArray(viewMedia.imgURL)
                          ? viewMedia.imgURL[0]
                          : viewMedia.imgURL
                      }
                      alt={viewMedia.alt || viewMedia.title || "Media image"}
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-zinc-900 text-zinc-500">
                      <div className="rounded-full bg-zinc-800 p-3">
                        <ImageOff size={22} />
                      </div>
                      <p className="text-xs">No image available</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-zinc-100">
                        {viewMedia?.title || "Untitled media"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {categoryMeta?.name || "Uncategorized"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        viewMedia?.isActive
                          ? "bg-green-400/60 text-gray-200"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {viewMedia?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {mediaDetails.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                            {item.label}
                          </p>
                          {item.field && item.value !== "Not available" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(String(item.value), item.field)
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-200"
                            >
                              {copiedField === item.field ? (
                                <>
                                  <Check size={12} />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  Copy
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <p className="break-all text-xs leading-5 text-zinc-200">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </div>

        {/* Modals */}
        {editMedia !== undefined && (
          <MediaFormModal
            media={editMedia}
            categories={categories}
            onClose={() => setEditMedia(undefined)}
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
    </AnimatePresence>
  );
};
