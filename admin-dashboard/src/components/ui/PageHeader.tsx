// PAGE HEADER

import { ReactNode } from "react";

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 className="text-xl font-bold text-zinc-100">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
