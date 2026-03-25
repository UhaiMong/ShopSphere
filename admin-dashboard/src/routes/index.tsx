import { lazy, Suspense, useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import {
  useAppSelector,
  useAppDispatch,
  selectIsAuthenticated,
  selectAuthLoading,
  adminGetMe,
} from "../app/store";
import { Sidebar, TopBar } from "../components/layout";
import { Spinner } from "../components/ui";
import { cn } from "@/utils";

// ── Lazy pages
const LoginPage = lazy(() =>
  import("../pages/Auth").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("../pages/Dashboard").then((m) => ({ default: m.DashboardPage })),
);
const ProductsPage = lazy(() =>
  import("../pages/Products").then((m) => ({ default: m.ProductsPage })),
);
const OrdersPage = lazy(() =>
  import("../pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("../pages/Orders").then((m) => ({ default: m.OrderDetailPage })),
);
const MediaPage = lazy(() =>
  import("../pages/Media").then((m) => ({ default: m.MediaPage })),
);
const UsersPage = lazy(() =>
  import("../pages/misc").then((m) => ({ default: m.UsersPage })),
);
const CategoriesPage = lazy(() =>
  import("../pages/misc").then((m) => ({ default: m.CategoriesPage })),
);
const AnalyticsPage = lazy(() =>
  import("../pages/misc").then((m) => ({ default: m.AnalyticsPage })),
);
const SettingsPage = lazy(() =>
  import("../pages/misc").then((m) => ({ default: m.SettingsPage })),
);

// Page loader
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// Protected route
const ProtectedRoute = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!isAuth) return <Navigate to="/auth/login" replace />;
  return <AdminLayout />;
};

// Admin layout with collapsible sidebar
const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar_collapsed") === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((p) => {
      localStorage.setItem("sidebar_collapsed", String(!p));
      return !p;
    });
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 z-40 h-full lg:hidden">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* Top bar */}
      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileOpen((p) => !p)}
        mobileMenuOpen={mobileOpen}
      />

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300 pt-14 min-h-screen",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-60",
        )}
      >
        <div className="p-5 lg:p-6 w-full">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

// Bootstrap: verify token on mount
export const AppBootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) void dispatch(adminGetMe());
    else dispatch({ type: "auth/getMe/rejected" });

    window.addEventListener("admin:logout", () => {
      window.location.href = "/auth/login";
    });
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

// Routes
const router = createBrowserRouter([
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
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
