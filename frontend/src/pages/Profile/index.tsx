// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Package, LogOut, Shield, HeartIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectCurrentUser,
  logout,
  setCredentials,
} from "../../features/auth/authSlice";
import { Button, Input } from "../../components/ui";
// import { cn } from '../../utils';
// import api from '../../services/api';
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

type ProfileTab = "account" | "security";

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { isSubmitting: isSavingProfile },
  } = useForm({
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    watch,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: isSavingPwd },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const newPwd = watch("newPassword");

  const onSaveProfile = async (data: { name: string; phone: string }) => {
    try {
      const { data: res } = await api.patch<{ data: typeof user }>(
        "/users/me",
        data,
      );
      dispatch(
        setCredentials({
          user: res.data!,
          accessToken: localStorage.getItem("accessToken")!,
        }),
      );
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const onChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await api.patch("/auth/change-password", data);
      toast.success("Password changed. Please sign in again.");
      resetPwd();
      await dispatch(logout());
      navigate("/auth/login");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to change password");
    }
  };

  const TABS = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ] as const;

  return (
    <div className="container-app py-10">
      <h1
        style={{ fontFamily: "Syne, sans-serif" }}
        className="text-3xl font-bold text-stone-900 mb-8"
      >
        My Account
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {/* Avatar */}
            <div className="p-6 text-center border-b border-stone-50">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span
                      style={{ fontFamily: "Syne, sans-serif" }}
                      className="text-3xl font-bold text-brand-600"
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <p className="font-semibold text-stone-900">{user?.name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
            </div>

            {/* Nav */}
            <nav className="p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as ProfileTab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    activeTab === id
                      ? "bg-brand-50 text-brand-700"
                      : "text-stone-600 hover:bg-stone-50",
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
              <Link
                to="/orders"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Package className="w-4 h-4" /> My Orders
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <HeartIcon className="w-4 h-4" /> Wishlist
              </Link>
              <hr className="my-1 border-stone-100" />
              <button
                onClick={async () => {
                  await dispatch(logout());
                  navigate("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "account" && (
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-6">
                Profile Information
              </h2>
              <form
                onSubmit={handleProfile(onSaveProfile)}
                className="space-y-5 max-w-md"
              >
                <Input
                  label="Full Name"
                  {...regProfile("name", { required: true })}
                />
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <Input
                  label="Phone (optional)"
                  type="tel"
                  {...regProfile("phone")}
                />
                <Button type="submit" isLoading={isSavingProfile}>
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-6">
                Change Password
              </h2>
              <form
                onSubmit={handlePwd(onChangePassword)}
                className="space-y-5 max-w-md"
              >
                <Input
                  label="Current Password"
                  type="password"
                  error={pwdErrors.currentPassword?.message}
                  {...regPwd("currentPassword", { required: "Required" })}
                />
                <Input
                  label="New Password"
                  type="password"
                  error={pwdErrors.newPassword?.message}
                  {...regPwd("newPassword", {
                    required: "Required",
                    minLength: { value: 8, message: "Min 8 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Must include uppercase, lowercase and number",
                    },
                  })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  error={pwdErrors.confirmPassword?.message}
                  {...regPwd("confirmPassword", {
                    required: "Required",
                    validate: (v) => v === newPwd || "Passwords do not match",
                  })}
                />
                <Button type="submit" variant="danger" isLoading={isSavingPwd}>
                  Update Password
                </Button>
                <p className="text-xs text-stone-400">
                  You will be signed out after changing your password.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from "react";
import type { Product } from "../../types";
import { ProductCard } from "../../components/shared/ProductCard";
import { SkeletonProductCard, EmptyState } from "../../components/ui";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlist } from "../../hooks";
import { cn } from "@/uitls";
import api from "@/services/app";

export const WishlistPage = () => {
  const { wishlistIds, reload } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void api
      .get<{ data: { products: Product[] } }>("/wishlist")
      .then(({ data }) => {
        setProducts(data.data.products);
        setIsLoading(false);
      });
  }, [wishlistIds]);

  return (
    <div className="container-app py-10">
      <h1
        style={{ fontFamily: "Syne, sans-serif" }}
        className="text-3xl font-bold text-stone-900 mb-8"
      >
        My Wishlist
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-14 h-14" />}
          title="Your wishlist is empty"
          description="Save products you love and come back to them anytime."
          action={
            <Link to="/products">
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Products
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
          {products.map((p, i) => (
            <div
              key={p._id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NOT FOUND PAGE
// ─────────────────────────────────────────────────────────────────────────────
export const NotFoundPage = () => (
  <div className="container-app flex flex-col items-center justify-center min-h-[70vh] text-center py-16">
    <p
      style={{ fontFamily: "Syne, sans-serif" }}
      className="text-[9rem] font-extrabold text-stone-100 leading-none select-none"
    >
      404
    </p>
    <h1
      style={{ fontFamily: "Syne, sans-serif" }}
      className="text-3xl font-bold text-stone-900 -mt-6 mb-3"
    >
      Page not found
    </h1>
    <p className="text-stone-500 mb-8 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/">
      <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
        Back to Home
      </Button>
    </Link>
  </div>
);
