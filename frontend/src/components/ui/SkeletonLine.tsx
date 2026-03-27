import { cn } from "@/utils/cn";

// SKELETON
export const SkeletonProductCard = () => (
  <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white">
    <div className="skeleton aspect-square w-full" />
    <div className="p-4 space-y-2.5">
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("skeleton rounded", className)} />
);
