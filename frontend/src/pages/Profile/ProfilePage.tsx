// PROFILE PAGE
import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Package, LogOut, Shield, HeartIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectCurrentUser,
  logout,
  setCredentials,
} from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/app";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
