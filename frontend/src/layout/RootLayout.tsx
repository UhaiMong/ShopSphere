import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageLoader } from "@/components/ui/PageLoader";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

// Root Layout
export const RootLayout = () => (
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
