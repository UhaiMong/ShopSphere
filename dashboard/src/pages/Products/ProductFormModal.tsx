import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { apiPost, apiPut } from "@/services/api";
import type { Product, Category, ProductVariant } from "@/types";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import MediaPickerModal from "../Media/MediaPickerModal";
import { useForm } from "react-hook-form";

// Types

type PickerMode = "multiple" | null;

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

// Helpers

/**
 * Safely converts any _id shape (ObjectId object, string, or populated doc)
 * to a plain string so we can do strict === comparisons everywhere.
 */
const toStr = (id: unknown): string => {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    // Mongoose ObjectId or populated doc
    const obj = id as Record<string, unknown>;
    if (obj._id !== undefined) return toStr(obj._id); // populated doc → recurse on _id
    if (typeof obj.toString === "function") return obj.toString(); // ObjectId.toString()
  }
  return String(id);
};

// Constants

const COLOR_PRESETS = [
  { name: "Black", hex: "#18181b" },
  { name: "White", hex: "#fafafa" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Red", hex: "#dc2626" },
  { name: "Olive", hex: "#65762e" },
  { name: "Grey", hex: "#71717a" },
  { name: "Beige", hex: "#d6c7a1" },
];

const EMPTY_DRAFT: ProductVariant = {
  _id: "",
  sku: "",
  color: "",
  size: "",
  stock: 0,
  price: undefined,
  images: [],
};

// Component

export const ProductFormModal = ({
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

  // ── Local state
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants?.map((v) => ({
      ...v,
      price: v?.price ? v.price / 100 : 0,
    })) ?? [],
  );
  const [draft, setDraft] = useState<ProductVariant>(EMPTY_DRAFT);
  const [variantPickerOpen, setVariantPickerOpen] = useState(false);

  // ── RHF setup
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      price: product ? product.price / 100 : 0,
      comparePrice: product?.comparePrice
        ? product.comparePrice / 100
        : undefined,
      category: toStr(product?.category),
      brand: product?.brand ?? "",
      stock: product?.stock ?? 0,
      sku: product?.sku ?? "",
      tags: product?.tags?.join(", ") ?? "",
      isFeatured: product?.isFeatured ?? false,
      isActive: product?.isActive ?? true,
    },
  });

  // ── Category resolution
  const watchedCategoryId = watch("category");

  const categoryOptions = categories.find(
    (c) => toStr(c._id) === watchedCategoryId,
  );

  const attrs = (categoryOptions?.variantAttributes ?? []) as Array<
    "size" | "color"
  >;
  const showVariants: boolean = categoryOptions?.hasVariants ?? false;

  // ── Stock sync
  const totalVariantStock = variants.reduce(
    (sum, v) => sum + (v.stock || 0),
    0,
  );

  useEffect(() => {
    if (showVariants) {
      setValue("stock", totalVariantStock);
    }
  }, [totalVariantStock, showVariants, setValue]);

  // ── Variant helpers
  const addVariant = () => {
    if (!draft.sku.trim()) {
      toast.error("SKU is required for a variant");
      return;
    }
    if (attrs.includes("size") && !draft.size?.trim()) {
      toast.error("Size is required");
      return;
    }
    if (attrs.includes("color") && !draft.color?.trim()) {
      toast.error("Color is required");
      return;
    }
    setVariants((prev) => [...prev, { ...draft, _id: crypto.randomUUID() }]);
    setDraft(EMPTY_DRAFT);
  };

  const removeVariant = (id: string) =>
    setVariants((prev) => prev.filter((v) => v._id !== id));

  const toCents = (val: any) =>
    val !== undefined && val !== null
      ? Math.round(Number(val) * 100)
      : undefined;

  // ── Submit

  const onSubmit = async (data: ProductForm) => {
    const selectedCategory = categories.find(
      (c) => toStr(c._id) === data.category,
    );
    const categoryRequiresVariants = selectedCategory?.hasVariants ?? false;

    if (categoryRequiresVariants && variants.length === 0) {
      toast.error("Add at least one variant for this category");
      return;
    }

    const payload = {
      ...data,
      price: Math.round(Number(data.price) * 100),
      comparePrice:
        data.comparePrice && Number(data.comparePrice) > Number(data.price)
          ? Math.round(Number(data.comparePrice) * 100)
          : undefined,
      stock: showVariants ? totalVariantStock : Number(data.stock),
      sku: data.sku?.trim() || undefined,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      images,
      variants: showVariants
        ? variants.map((v) => ({
            ...v,
            price: toCents(v.price),
          }))
        : [],
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

  console.log("variants →", variants);
  // ── Render
  return (
    <>
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
          {/* ── Images */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Images
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, i) => (
                <div key={i} className="relative group w-24 h-24">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover rounded-lg border border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPickerMode("multiple")}
                className="w-24 h-24 border-2 border-dashed border-zinc-700 rounded-lg
                  flex flex-col items-center justify-center cursor-pointer
                  hover:border-zinc-500 transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] text-zinc-600 mt-1">Add</span>
              </button>
            </div>
          </div>

          {/* ── Core fields */}
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
              step="1"
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
                // FIX: always pass _id as a plain string to <option> value
                ...categories.map((c) => ({
                  value: toStr(c._id),
                  label: c.name,
                })),
              ]}
              {...register("category", {
                // FIX: single validate rule — rejects "" and undefined
                validate: (v) =>
                  Boolean(v && v.trim()) || "Please select a category",
              })}
            />

            <Input label="Brand" {...register("brand")} />
          </div>

          {/* ── Variants section (outside the 2-col grid so it spans full width) */}
          {showVariants && (
            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <label className="block text-xs font-medium text-zinc-400">
                Variants * ({attrs.join(" + ")})
              </label>

              {/* Existing variant rows */}
              {variants.length > 0 && (
                <div className="space-y-1.5">
                  {variants.map((v) => (
                    <div
                      key={v._id}
                      className="flex items-center gap-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2"
                    >
                      {/* Color swatch */}
                      {attrs.includes("color") && v.color && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-zinc-600"
                            style={{
                              backgroundColor:
                                COLOR_PRESETS.find((c) => c.name === v.color)
                                  ?.hex ?? "#888",
                            }}
                          />
                        </span>
                      )}
                      {/* Variant image thumbnail */}
                      {v.images && v.images.length > 0 && (
                        <img
                          src={v.images[0]}
                          alt=""
                          className="w-6 h-6 rounded object-cover shrink-0"
                        />
                      )}
                      <span className="text-zinc-400 text-xs w-20 truncate">
                        {v.sku}
                      </span>
                      {attrs.includes("size") && (
                        <span className="text-zinc-300">{v.size}</span>
                      )}
                      {attrs.includes("color") && (
                        <span className="text-zinc-300">{v.color}</span>
                      )}
                      <span className="text-zinc-500 text-xs ml-auto">
                        Stock: {v.stock}
                      </span>
                      {v.price !== undefined && (
                        <span className="text-zinc-500 text-xs">
                          ৳{v.price}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeVariant(v._id)}
                        className="text-red-400 hover:text-red-300 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Color picker (shown when color is a variant attribute) */}
              {attrs.includes("color") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Pick color
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          title={c.name}
                          onClick={() =>
                            setDraft((d) => ({ ...d, color: c.name }))
                          }
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            draft.color === c.name
                              ? "border-orange-500 scale-110"
                              : "border-zinc-700"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                    <Input
                      placeholder="Or type custom color"
                      value={draft.color ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, color: e.target.value }))
                      }
                    />
                  </div>

                  {/* Images for this color variant */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Images for this color
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(draft.images ?? []).map((img, i) => (
                        <div key={i} className="relative w-12 h-12">
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover rounded border border-zinc-700"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                images: (d.images ?? []).filter(
                                  (_, j) => j !== i,
                                ),
                              }))
                            }
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X className="w-2 h-2 text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setVariantPickerOpen(true)}
                        className="w-12 h-12 border-2 border-dashed border-zinc-700 rounded flex items-center justify-center hover:border-zinc-500"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-zinc-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add new variant row */}
              <div className="grid grid-cols-5 gap-2 items-end">
                <Input
                  label="SKU *"
                  value={draft.sku}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, sku: e.target.value }))
                  }
                />
                {attrs.includes("size") && (
                  <Input
                    label="Size"
                    placeholder="S / M / L / XL"
                    value={draft.size ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, size: e.target.value }))
                    }
                  />
                )}
                {attrs.includes("color") && (
                  <Input
                    label="Color"
                    placeholder="Red"
                    value={draft.color ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, color: e.target.value }))
                    }
                  />
                )}
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  // FIX: always a number string, never undefined → no controlled/uncontrolled flip
                  value={draft.stock}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      stock: Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Price (৳, opt.)"
                  type="number"
                  step="0.01"
                  // FIX: always a string ("" or numeric string), never undefined
                  value={draft.price ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      price:
                        e.target.value !== ""
                          ? Number(e.target.value)
                          : undefined,
                    }))
                  }
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                + Add Variant
              </Button>
            </div>
          )}

          {/* ── Stock & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={showVariants ? "Stock (auto from variants)" : "Stock *"}
              type="number"
              min="0"
              disabled={showVariants}
              error={errors.stock?.message}
              // FIX: no `value` prop here — RHF owns this via register + setValue above.
              // Passing value={} alongside register() causes the controlled/uncontrolled warning.
              {...register("stock", {
                required: !showVariants ? "Stock is required" : false,
                min: { value: 0, message: "Stock must be positive" },
              })}
            />
            <Input label="SKU" {...register("sku")} />
          </div>

          {/* ── Text fields */}
          <Textarea
            label="Description *"
            error={errors.description?.message}
            {...register("description", {
              required: "Description is required",
            })}
          />
          <Input label="Short Description" {...register("shortDescription")} />
          <Input
            label="Tags (comma-separated)"
            placeholder="electronics, smartphone, 5g"
            {...register("tags")}
          />

          {/* ── Toggles */}
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

          {/* ── Actions */}
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

      {/* Product image picker */}
      <MediaPickerModal
        open={pickerMode === "multiple"}
        onClose={() => setPickerMode(null)}
        multi
        onSelectMultiple={(urls) =>
          setImages((prev) => [
            ...prev,
            ...urls.filter((u) => !prev.includes(u)),
          ])
        }
      />

      {/* Variant image picker */}
      <MediaPickerModal
        open={variantPickerOpen}
        onClose={() => setVariantPickerOpen(false)}
        multi
        onSelectMultiple={(urls) =>
          setDraft((d) => ({
            ...d,
            images: [
              ...(d.images ?? []),
              ...urls.filter((u) => !(d.images ?? []).includes(u)),
            ],
          }))
        }
      />
    </>
  );
};
