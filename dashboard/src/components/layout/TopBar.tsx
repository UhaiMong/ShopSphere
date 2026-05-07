import { Bell, Menu, X } from "lucide-react";
import { useAppSelector, selectAdmin } from "../../app/store";
import { cn } from "@/utils";

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
