import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { PageLoader } from "@/components/ui/PageLoader";
import { ProtectedRoute } from "./ProtectedRoute";

// ── Lazy pages
const LoginPage = lazy(() =>
  import("../pages/Auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("../pages/Dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const ProductsPage = lazy(() =>
  import("../pages/Products/ProductsPage").then((m) => ({
    default: m.ProductsPage,
  })),
);
const OrdersPage = lazy(() =>
  import("../pages/Orders/OrdersPage").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("../pages/Orders/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  })),
);
const MediaPage = lazy(() =>
  import("../pages/Media/MediaPage").then((m) => ({ default: m.MediaPage })),
);
const HeroPage = lazy(() =>
  import("../pages/Hero/HeroPage").then((m) => ({ default: m.HeroPage })),
);
const UsersPage = lazy(() =>
  import("../pages/Users/UsersPage").then((m) => ({ default: m.UsersPage })),
);
const CategoriesPage = lazy(() =>
  import("../pages/Categories/CategoriesPage").then((m) => ({
    default: m.CategoriesPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("../pages/Analytics/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../pages/Settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);

// Routes
export const router = createBrowserRouter([
  {
    path: "/auth/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "media", element: <MediaPage /> },
      { path: "hero", element: <HeroPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
