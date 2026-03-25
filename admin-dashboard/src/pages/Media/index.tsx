import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiPatch, api } from "@/services/api";
import {
  Button,
  Badge,
  Input,
  Select,
  Modal,
  ConfirmDialog,
  Pagination,
  PageHeader,
  SearchInput,
  SkeletonRow,
  EmptyState,
  Toggle,
} from "../../components/ui";
import toast from "react-hot-toast";
import { formatPrice, formatDate, truncate, cn } from "@/utils";
import type { Product, Category, PaginatedResponse, Media } from "@/types";

interface MediaForm {
  title: string;
  alt?: string;
  category: string;
}

interface SelectedFile {
  file: File;
  preview: string;
}

const MediaFormModal = ({
  media,
  categories,
  onClose,
  onSaved,
}: {
  media?: Media | any;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const isEdit = Boolean(media);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MediaForm>({
    defaultValues: {
      title: media?.title ?? "",
      alt: media?.alt ?? "",
      category:
        typeof media?.category === "object"
          ? media?.category?._id
          : (media?.category ?? ""),
    },
  });

  // ── File selection (shared by input + drop)
  const selectFile = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or AVIF images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    // Revoke previous preview URL to avoid memory leaks
    setSelectedFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return { file, preview: URL.createObjectURL(file) };
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) selectFile(file);
    },
    [selectFile],
  );

  const clearFile = () => {
    setSelectedFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
  };

  // ── Submit: build FormData and POST/PATCH
  const onSubmit = async (formData: MediaForm) => {
    if (!isEdit && !selectedFile) {
      toast.error("Please select an image to upload");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("category", formData.category);
      if (formData.alt) form.append("alt", formData.alt);
      if (selectedFile) form.append("imgURL", selectedFile.file);

      if (isEdit && media) {
        await apiPatch(`/media/${media._id}`, form);
        toast.success("Media updated");
      } else {
        await apiPost("/media", form);
        toast.success("Media created");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed");
    } finally {
      setUploading(false);
    }
  };

  const isBusy = isSubmitting || uploading;

  return (
    <Modal
      isOpen
      title={isEdit ? "Edit Media" : "New Media"}
      onClose={onClose}
      size="xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
      >
        {/* ── Drop zone / Preview ── */}
        {selectedFile ? (
          // Preview
          <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
            <img
              src={selectedFile.preview}
              alt="Preview"
              className="w-full max-h-56 object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-white bg-zinc-800/80 px-3 py-1.5 rounded-lg mr-2 hover:bg-zinc-700 transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clearFile}
                className="text-xs text-red-400 bg-zinc-800/80 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-400 truncate">
                {selectedFile.file.name}
              </span>
              <span className="text-xs text-zinc-600 ml-auto shrink-0">
                {(selectedFile.file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        ) : (
          // Drop zone
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none
              ${
                dragOver
                  ? "border-indigo-500 bg-indigo-900/20"
                  : "border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900"
              }`}
          >
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div
                className={`p-3 rounded-full ${dragOver ? "bg-indigo-500/20" : "bg-zinc-800"}`}
              >
                {dragOver ? (
                  <Upload size={22} className="text-indigo-400" />
                ) : (
                  <ImageIcon size={22} className="text-zinc-500" />
                )}
              </div>
              <p className="text-sm text-zinc-300 font-medium">
                {dragOver ? "Drop to select" : "Drag & drop or click to browse"}
              </p>
              <p className="text-xs text-zinc-600">
                JPEG · PNG · WebP · AVIF &nbsp;·&nbsp; Max 5 MB
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleInputChange}
        />

        {/* ── Existing image (edit mode, no new file selected) ── */}
        {isEdit && media?.imgURL && !selectedFile && (
          <div className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
            <img
              src={media.imgURL as string}
              alt={media.alt ?? media.title}
              className="w-full max-h-48 object-contain"
            />
            <p className="text-xs text-zinc-500 px-3 py-2 border-t border-zinc-800">
              Current image — select a new file above to replace
            </p>
          </div>
        )}

        {/* ── Fields ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Title *"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
          </div>
          <Select
            label="Category *"
            error={errors.category?.message}
            options={[
              { value: "", label: "Select category" },
              ...categories.map((c) => ({ value: c._id, label: c.name })),
            ]}
            {...register("category", { required: "Category is required" })}
          />
          <Input label="Alt Text" {...register("alt")} />
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isBusy} disabled={isBusy}>
            {isBusy
              ? "Uploading…"
              : isEdit
                ? "Save Changes"
                : "Upload & Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Media Table Page
export const MediaPage = () => {
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
  const [editMedia, setEditMedia] = useState<Product | null | undefined>(
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiPatch(`/media/${deleteId}`, {});
      await api.delete(`/media/${deleteId}`);
      toast.success("Product deleted");
      void load(pagination.page);
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
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
      <div className="card overflow-hidden">
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
                  const catName =
                    typeof p.category === "object" ? p.category?.name : "";
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                            {p.imgURL && (
                              <img
                                src={p.imgURL}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-200">
                              {truncate(p.title, 40)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge color="zinc">{catName || "—"}</Badge>
                      </td>
                      <td>
                        <p className="text-xs font-medium text-zinc-200">
                          {p.title}
                        </p>
                      </td>
                      <td>{p.fileSize}</td>
                      <td>
                        <Badge color={p.isActive ? "green" : "red"}>
                          {p.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setEditMedia(p as any)}
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
  );
};
