import { useEffect } from "react";
import { Spinner } from "./Spinner";

type PageLoaderProps = {
  loading?: boolean;
  title?: string;
  overlay?: boolean;
};

export const PageLoader = ({
  loading = true,
  title = "Loading, please wait...",
  overlay = true,
}: PageLoaderProps) => {
  useEffect(() => {
    if (!overlay || !loading) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [overlay, loading]);

  if (!loading) return null;

  return (
    <div
      className={`flex items-center justify-center ${
        overlay ? "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" : "relative"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200/30 bg-white/95 px-6 py-5 shadow-lg shadow-slate-900/10 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-100">
        <Spinner size="lg" />
        <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
      </div>
    </div>
  );
};
