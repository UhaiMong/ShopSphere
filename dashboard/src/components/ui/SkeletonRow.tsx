// SKELETON

import { ReactNode } from "react";

export const SkeletonRow = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

// EMPTY STATE
export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 text-zinc-700">{icon}</div>}
    <p className="font-medium text-zinc-400">{title}</p>
    {description && (
      <p className="text-xs text-zinc-600 mt-1 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
