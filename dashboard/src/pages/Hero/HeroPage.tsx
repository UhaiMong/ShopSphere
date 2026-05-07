import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, LayoutGrid, List, X } from "lucide-react";
import { apiGet, apiPut, apiPatch, api } from "@/services/api";
import { formatPrice, truncate, cn } from "@/utils";
import type { Product, Category, PaginatedResponse, Hero } from "@/types";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState, SkeletonRow } from "@/components/ui/SkeletonRow";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HeroFormModal } from "./HeroFormModal";
import { AnimatePresence, motion } from "framer-motion";

// Products Table Page
export const HeroPage = () => {
  const [hero, setHero] = useState<Hero[]>([]);
  const [preview, setPreview] = useState<Hero | null | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [editHero, setEditHero] = useState<Hero | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // --- Actions ---
  const toggleView = (mode: "grid" | "list") => setViewMode(mode);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<Hero>("/hero/all");
      setHero((res as any).data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiPatch(`/hero/${deleteId}/soft-delete`, {});
      toast.success("Hero stored in trash");
      await api.delete(`/hero/${deleteId}/permanent`);
      toast.success("Hero deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div>
        <PageHeader
          title="Products"
          actions={
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setEditHero(null)}
            >
              New Product
            </Button>
          }
        />
        <div className="p-6 bg-zinc-950 min-h-screen text-zinc-200">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hero Sections</h1>
              <p className="text-zinc-400 text-sm">
                Manage your homepage sliders and offers.
              </p>
            </div>

            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => toggleView("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-brand-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => toggleView("list")}
                className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-brand-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT SIDE: Details Preview Pane */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "400px" }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  className="hidden lg:block shrink-0"
                >
                  <div className="sticky top-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="relative h-48 bg-zinc-800">
                      <img
                        src={preview.backgroundImage}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                      <button
                        onClick={() => setPreview(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-brand-400 font-bold">
                          {preview.offer || "No Offer"}
                        </span>
                        <h2 className="text-xl font-bold mt-1">
                          {preview.title}
                        </h2>
                        <p className="text-zinc-400 text-sm mt-2">
                          {preview.subtitle}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-2">CTA Action</p>
                        <a
                          href={preview.ctaLink}
                          className="inline-block w-full text-center bg-zinc-800 hover:bg-brand-500 py-2 rounded-md transition-colors"
                        >
                          {preview.ctaText}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RIGHT SIDE: Main Content (Grid or List) */}
            <div className="grow">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-zinc-900 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : hero.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                  <p className="text-zinc-500">No hero sections found.</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                      : "flex flex-col gap-3"
                  }
                >
                  {hero.map((item) => (
                    <HeroCard
                      key={item._id}
                      data={item}
                      mode={viewMode}
                      onView={() => setPreview(item)}
                      onRefresh={load}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {editHero !== undefined && (
          <HeroFormModal
            hero={editHero}
            onClose={() => setEditHero(undefined)}
            onSaved={load}
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
    </>
  );
};
// --- Sub-component for individual items ---
const HeroCard = ({
  data,
  mode,
  onView,
  onRefresh,
}: {
  data: Hero;
  mode: "grid" | "list";
  onView: () => void;
  onRefresh: () => void;
}) => {
  const [editHero, setEditHero] = useState<Hero | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isList = mode === "list";

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiPatch(`/hero/${deleteId}/soft-delete`, {});
      toast.success("Hero stored in trash");
      await api.delete(`/hero/${deleteId}/permanent`);
      toast.success("Hero deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div
        className={`
      bg-zinc-900 border border-zinc-800 hover:border-brand-500/50 transition-all group
      ${isList ? "flex items-center p-3 gap-4 rounded-lg" : "flex flex-col p-4 rounded-xl"}
    `}
      >
        <div
          className={`shrink-0 overflow-hidden rounded-lg bg-zinc-800 ${isList ? "w-12 h-12" : "w-full h-32 mb-4"}`}
        >
          <img
            src={data.backgroundImage}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt=""
          />
        </div>

        <div className="grow min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold truncate text-zinc-100">
              {data.title}
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${data.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}`}
            >
              {data.isActive ? "Active" : "Hidden"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate">{data.subtitle}</p>
          {data.offer && (
            <p className="text-[10px] text-brand-300 mt-1">{data.offer}</p>
          )}
        </div>

        <div
          className={`flex gap-1 ${isList ? "ml-auto" : "mt-4 pt-3 border-t border-zinc-800 justify-end"}`}
        >
          <button
            onClick={onView}
            className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-brand-400 transition-colors"
          >
            <Eye size={16} />
          </button>
          <button className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors">
            <Pencil onClick={() => setEditHero(data)} size={16} />
          </button>
          <button
            onClick={() => setDeleteId(data._id)}
            className="p-2 hover:bg-zinc-800 rounded-md text-red-400/50 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {editHero !== undefined && (
        <HeroFormModal
          hero={editHero}
          onClose={() => setEditHero(undefined)}
          onSaved={onRefresh}
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
    </>
  );
};
