import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/layout/CartDrawer";
import { Spinner } from "../components/ui";
import { ProtectedRoute } from "./ProtectedRoute";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const HomePage = lazy(() =>
  import("../pages/Home").then((m) => ({ default: m.HomePage })),
);
const ProductListPage = lazy(() =>
  import("../pages/ProductList").then((m) => ({ default: m.ProductListPage })),
);
const ProductDetailPage = lazy(() =>
  import("../pages/ProductDetail").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const CartPage = lazy(() =>
  import("../pages/Cart").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("../pages/Checkout").then((m) => ({ default: m.CheckoutPage })),
);
const OrdersPage = lazy(() =>
  import("../pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("../pages/Orders").then((m) => ({ default: m.OrderDetailPage })),
);
const ProfilePage = lazy(() =>
  import("../pages/Profile").then((m) => ({ default: m.ProfilePage })),
);
const WishlistPage = lazy(() =>
  import("../pages/Wishlist").then((m) => ({ default: m.WishlistPage })),
);
const LoginPage = lazy(() =>
  import("../pages/Auth").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("../pages/Auth").then((m) => ({ default: m.RegisterPage })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFound").then((m) => ({ default: m.NotFoundPage })),
);

// ── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

// ── Root Layout ───────────────────────────────────────────────────────────────
const RootLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <CartDrawer />
    <main className="flex-1">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

// ── Auth Layout (no footer) ───────────────────────────────────────────────────
const AuthLayout = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "wishlist", element: <WishlistPage /> },

      // Protected routes (require login)
      {
        element: <ProtectedRoute />,
        children: [
          { path: "checkout", element: <CheckoutPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "orders/:id", element: <OrderDetailPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
