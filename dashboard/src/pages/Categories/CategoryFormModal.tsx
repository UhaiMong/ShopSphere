import { useForm } from "react-hook-form";

import toast from "react-hot-toast";
import { apiPost, apiPut } from "@/services/api";

import { Category } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
// CATEGORIES PAGE
interface CatForm {
  name: string;
  description?: string;
  icon?: string;
  parent?: string;
  sortOrder?: number;
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
    formState: { errors, isSubmitting },
  } = useForm<CatForm>({
    defaultValues: {
      name: cat?.name ?? "",
      description: cat?.description ?? "",
      icon: cat?.icon ?? "",
      parent: cat?.parent ?? "",
      sortOrder: cat?.sortOrder ?? 0,
    },
  });
  const onSubmit = async (data: CatForm) => {
    try {
      if (cat) {
        await apiPut(`/categories/${cat._id}`, data);
        toast.success("Category updated");
      } else {
        await apiPost("/categories", data);
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
                <option key={c._id} value={c._id}>
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
