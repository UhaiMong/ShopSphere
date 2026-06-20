import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import toast from "react-hot-toast";
import api, { apiGet } from "@/services/api";

import { Category } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { Badge } from "@/components/ui/Badge";
import { CategoryFormModal } from "./CategoryFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Category Main component
export const CategoriesPage = () => {
  const [cats, setCats] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCat, setEditCat] = useState<Category | null | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<{ data: Category[] }>("/categories");
      setCats((res as any).data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success("Deleted");
      void load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const roots = cats.filter((c) => !c.parent);
  const getChildren = (id: string) => cats.filter((c) => c.parent === id);

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${cats.length} categories`}
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setEditCat(null)}
          >
            New Category
          </Button>
        }
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Sub-categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={5} />
                  ))
                : roots.map((cat) => {
                    const children = getChildren(cat._id);
                    return [
                      <tr key={cat._id} className="bg-zinc-800/10">
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {cat.icon ?? "📁"}
                            </span>
                            <span className="text-xs font-semibold text-zinc-100">
                              {cat?.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {cat?.slug}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-zinc-400">
                            {children.length}
                          </span>
                        </td>
                        <td>
                          <Badge color={cat?.isActive ? "green" : "red"}>
                            {cat?.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setEditCat(cat)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setDeleteId(cat?._id)}
                              className="text-red-400 hover:bg-red-500/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>,
                      ...children.map((child) => (
                        <tr key={child._id}>
                          <td>
                            <div className="flex items-center gap-2 pl-6">
                              <span className="text-zinc-700 text-xs">└</span>
                              <span className="text-sm">
                                {child.icon ?? "📄"}
                              </span>
                              <span className="text-xs text-zinc-400">
                                {child.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="text-[10px] font-mono text-zinc-600">
                              {child.slug}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-zinc-600">—</span>
                          </td>
                          <td>
                            <Badge color={child.isActive ? "green" : "red"}>
                              {child.isActive ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setEditCat(child)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setDeleteId(child._id)}
                                className="text-red-400 hover:bg-red-500/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )),
                    ];
                  })}
            </tbody>
          </table>
        </div>
      </div>
      {editCat !== undefined && (
        <CategoryFormModal
          cat={editCat}
          categories={cats}
          onClose={() => setEditCat(undefined)}
          onSaved={() => void load()}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        isLoading={isDeleting}
        title="Delete Category"
        description="Products in this category will need to be re-categorized. Remove sub-categories first."
        confirmLabel="Delete"
      />
    </div>
  );
};
