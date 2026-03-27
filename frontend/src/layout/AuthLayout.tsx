import { PageLoader } from "@/components/ui/PageLoader";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

// ── Auth Layout (no footer)
export const AuthLayout = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);
