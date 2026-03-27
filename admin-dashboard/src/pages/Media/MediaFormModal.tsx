import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { Upload, CheckCircle2, ImageIcon } from "lucide-react";
import { apiPost, apiPatch } from "@/services/api";
import toast from "react-hot-toast";
import type { Category, Media } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

// Media Upload Form
interface MediaForm {
  title: string;
  alt?: string;
  category: string;
}

interface SelectedFile {
  file: File;
  preview: string;
}

export const MediaFormModal = ({
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

  // Handle drag and drop

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) selectFile(file);
    },
    [selectFile],
  );

  // Clear selected file
  const clearFile = () => {
    setSelectedFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
  };

  // Submit: build FormData and POST/PATCH
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
