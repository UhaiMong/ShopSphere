import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { apiPost, apiPut } from "@/services/api";
import { Category } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CatForm {
  name: string;
  description?: string;
  icon?: string;
  parent?: string;
  sortOrder?: number;
  hasVariants: boolean;
  variantAttributes: string[];
}

export const CategoryFormModal = ({
  cat,
  categories,
  onClose,
  onSaved,
}: {
  cat?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CatForm>({
    defaultValues: {
      name: cat?.name ?? "",
      description: cat?.description ?? "",
      icon: cat?.icon ?? "",
      // FIX: normalize parent _id to string (same ObjectId issue as Product)
      parent:
        typeof cat?.parent === "object" && cat?.parent !== null
          ? ((cat.parent as any)._id ?? "")
          : (cat?.parent ?? ""),
      sortOrder: cat?.sortOrder ?? 0,
      // FIX: explicitly cast to boolean — Mongoose returns true/false but
      // if it ever comes as a string "true" this guards against it
      hasVariants: Boolean(cat?.hasVariants ?? false),
      // FIX: ensure it's always a real array, never undefined/null
      variantAttributes: Array.isArray(cat?.variantAttributes)
        ? cat.variantAttributes
        : [],
    },
  });

  const hasVariants = watch("hasVariants");

  const onSubmit = async (data: CatForm) => {
    const payload = {
      ...data,
      // FIX: coerce to boolean explicitly — HTML checkbox can smuggle "on" strings
      hasVariants: Boolean(data.hasVariants),
      variantAttributes: data.hasVariants ? data.variantAttributes : [],
    };

    console.log("Category payload →", payload); // verify in devtools before removing

    try {
      if (cat) {
        await apiPut(`/categories/${cat._id}`, payload);
        toast.success("Category updated");
      } else {
        await apiPost("/categories", payload);
        toast.success("Category created");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Save failed");
    }
  };

  return (
    <Modal
      isOpen
      title={cat ? "Edit Category" : "New Category"}
      onClose={onClose}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name *"
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />
        <Input label="Description" {...register("description")} />
        <Input label="Icon (emoji)" placeholder="💻" {...register("icon")} />

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Parent Category
          </label>
          <select
            {...register("parent")}
            className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none hover:border-zinc-600 transition-colors"
          >
            <option value="">None (Root)</option>
            {categories
              .filter((c) => !c.parent)
              .map((c) => (
                // FIX: always string value so it matches the defaultValue string
                <option key={c._id} value={String(c._id)}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        <Input
          label="Sort Order"
          type="number"
          {...register("sortOrder", { valueAsNumber: true })}
        />

        {/* Variant configuration */}
        <div className="border-t border-zinc-800 pt-3 space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              // FIX: no setValueAs needed — RHF handles boolean for single
              // checkboxes correctly when defaultValues has a real boolean.
              // The key fix is ensuring defaultValues.hasVariants is Boolean(), not a string.
              {...register("hasVariants")}
              className="accent-orange-500"
            />
            <span className="text-sm text-zinc-300">
              Products in this category have variants
            </span>
          </label>

          {hasVariants && (
            <div className="pl-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Variant Attributes
              </label>
              <div className="flex gap-6">
                {(["size", "color"] as const).map((attr) => (
                  <label
                    key={attr}
                    className="flex items-center gap-2.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={attr}
                      // FIX: register once with the field name — RHF collects all
                      // checkboxes sharing the same name into an array automatically.
                      // The defaultValues array ["size","color"] pre-checks them correctly.
                      {...register("variantAttributes")}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-zinc-300 capitalize">
                      {attr}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isSubmitting}>
            {cat ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
