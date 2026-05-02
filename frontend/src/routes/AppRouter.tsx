import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RootLayout } from "@/layout/RootLayout";
import { AuthLayout } from "@/layout/AuthLayout";

// Lazy-loaded pages
const HomePage = lazy(() =>
  import("../pages/Home/HomePage").then((m) => ({ default: m.HomePage })),
);
const ProductListPage = lazy(() =>
  import("../pages/ProductList/ProductListPage").then((m) => ({
    default: m.ProductListPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("../pages/ProductDetail/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const CartPage = lazy(() =>
  import("../pages/Cart/CartPage").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("../pages/Checkout/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
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

const VerifyEmailPage = lazy(() =>
  import("../pages/Auth/VerifyEmail").then((m) => ({
    default: m.VerifyEmail,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/Profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const WishlistPage = lazy(() =>
  import("../pages/Wishlist/WishListPage").then((m) => ({
    default: m.WishlistPage,
  })),
);
const LoginPage = lazy(() =>
  import("../pages/Auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("../pages/Auth/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFound/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

//  Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "/verify-email/:token", element: <VerifyEmailPage /> },
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
