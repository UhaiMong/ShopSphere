import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PageLoader } from "@/components/ui/PageLoader";
import { cn } from "@/utils";
import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router";

// Admin layout with collapsible sidebar
export const AdminLayout = () => {
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
