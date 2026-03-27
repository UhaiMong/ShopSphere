import { ReactNode } from "react";

// EMPTY STATE
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="mb-4 text-stone-300">{icon}</div>}
    <h3 className="text-lg font-semibold text-stone-800 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-stone-500 max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);
