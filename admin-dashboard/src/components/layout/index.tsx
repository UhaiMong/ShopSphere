import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap,
  Menu,
  X,
  Search,
  Images,
} from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  adminLogout,
  selectAdmin,
} from "../../app/store";
// import { cn } from "../../utils";
import toast from "react-hot-toast";

//  Nav items
const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/media", icon: Images, label: "Media" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
];

// SIDEBAR

export const Sidebar = ({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const admin = useAppSelector(selectAdmin);

  const handleLogout = async () => {
    await dispatch(adminLogout());
    toast.success("Logged out");
    navigate("/auth/login");
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen flex flex-col bg-zinc-950 border-r border-zinc-800/60",
        "transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 h-14 border-b border-zinc-800/60 shrink-0",
          collapsed && "justify-center",
        )}
      >
        <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" fill="currentColor" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-zinc-100 leading-none">
              ShopSphere
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60",
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + collapse */}
      <div className="border-t border-zinc-800/60 p-2 space-y-1 shrink-0">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "",
              isActive
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60",
            )
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* User */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2",
            collapsed && "justify-center",
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-orange-400">
              {admin?.name?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {admin?.name}
              </p>
              <p className="text-[10px] text-zinc-600 truncate capitalize">
                {admin?.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors",
            collapsed && "justify-center",
          )}
          title="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

// TOP BAR

export const TopBar = ({
  sidebarCollapsed,
  onMobileMenuToggle,
  mobileMenuOpen,
}: {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}) => {
  const admin = useAppSelector(selectAdmin);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60",
        "transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-60",
        "lg:left-auto",
      )}
    >
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 text-zinc-500 hover:text-zinc-100"
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Right */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="live-dot" />
          Live
        </div>
        <button className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-orange-400">
              {admin?.name?.charAt(0) ?? "A"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-300 leading-none">
              {admin?.name}
            </p>
            <p className="text-[10px] text-zinc-600 capitalize mt-0.5">
              {admin?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

// ORDER STATUS BADGE

import { cn } from "@/utils";
import { OrderStatus } from "@/types";
import { Badge } from "../ui";

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "yellow",
  confirmed: "blue",
  processing: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
  refunded: "zinc",
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge color={ORDER_COLORS[status]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);
