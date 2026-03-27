import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImagePlus, X } from "lucide-react";
import { apiPatch, apiPost, apiPut } from "@/services/api";
import type { Product, Category } from "@/types";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import MediaPickerModal from "../Media/MediaPickerModal";

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
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const closePicker = () => setPickerMode(null);

  const {
    register,
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

  const onSubmit = async (data: ProductForm) => {
    const payload = {
      ...data,
      price: Math.round(Number(data.price) * 100),

      comparePrice:
        data.comparePrice && Number(data.comparePrice) > Number(data.price)
          ? Math.round(Number(data.comparePrice) * 100)
          : undefined,

      stock: Number(data.stock),

      sku: data.sku?.trim() || undefined,

      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],

      images,
    };
    console.log("Update/Post sent as payload: ", payload);
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
          {/* Images */}
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

          {/*  Fields  */}
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
              {...register("category", {
                required: "Category is required",
                validate: (v) => v !== "" || "Please select a category",
              })}
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

      {/* Multi-select picker — appends new URLs, skips duplicates */}
      <MediaPickerModal
        open={pickerMode === "multiple"}
        onClose={closePicker}
        multi
        onSelectMultiple={(urls) =>
          setImages((prev) => [
            ...prev,
            ...urls.filter((u) => !prev.includes(u)),
          ])
        }
      />
    </>
  );
};
