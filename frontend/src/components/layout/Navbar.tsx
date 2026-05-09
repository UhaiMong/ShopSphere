import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  LogOut,
  Heart,
  Package,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from "../../features/auth/authSlice";
import { selectCartItemCount } from "../../features/cart/cartSlice";
import {
  toggleCart,
  setMobileMenu,
  selectIsMobileMenuOpen,
} from "../../features/ui/uiSlice";
// import { cn } from "../../utils";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import { Button } from "../ui/Button";
import LOGO from "../../assets/logo_horizontal_200.png";

const NAV_LINKS = [
  { to: "/products", label: "Shop" },
  { to: "/products?isFeatured=true", label: "Featured" },
  { to: "/products?sort=popular", label: "Best Sellers" },
];

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cartCount = useAppSelector(selectCartItemCount);
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setIsUserMenuOpen(false);
    if (isUserMenuOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isUserMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm"
            : "bg-white",
        )}
      >
        <div className="container-app">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-52 h-auto rounded-lg flex items-center justify-center">
                <img
                  src={LOGO}
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-600"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-sm hidden md:block"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                  placeholder="Search products..."
                  className={cn(
                    "w-full pl-9 pr-4 py-2 text-sm rounded-xl border transition-all duration-200",
                    "placeholder:text-stone-400 text-stone-900 bg-stone-50",
                    isSearchFocused
                      ? "border-brand-300 bg-white ring-2 ring-brand-100 outline-none"
                      : "border-stone-200 hover:border-stone-300",
                  )}
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1">
              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-fade-in">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen((p) => !p);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-brand-600">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-stone-400 transition-transform",
                        isUserMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl border border-stone-100 shadow-lg shadow-stone-100/60 py-1 animate-fade-up">
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                      <hr className="my-1 border-stone-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/auth/login")}
                  >
                    Sign in
                  </Button>
                  <Button size="sm" onClick={() => navigate("/auth/register")}>
                    Sign up
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
                onClick={() => dispatch(setMobileMenu(!isMobileMenuOpen))}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white animate-fade-up">
            <div className="container-app py-4 space-y-1">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </form>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => dispatch(setMobileMenu(false))}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      navigate("/auth/login");
                      dispatch(setMobileMenu(false));
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      navigate("/auth/register");
                      dispatch(setMobileMenu(false));
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Header spacer */}
      <div className="h-16" />
    </>
  );
};
