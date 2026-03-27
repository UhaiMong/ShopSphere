import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Zap, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils";
import { adminLogin, useAppDispatch } from "@/app/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    const result = await dispatch(adminLogin(data));
    if (adminLogin.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      navigate("/");
    } else {
      toast.error(String(result.payload) ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <Zap className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">ShopSphere Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Sign in to your admin account
          </p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="admin@shopsphere.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
            />

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full px-3 py-2 pr-10 text-sm bg-zinc-900 border rounded-lg text-zinc-100 placeholder:text-zinc-600",
                    "focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors hover:border-zinc-600",
                    errors.password ? "border-red-500/50" : "border-zinc-700",
                  )}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              className="mt-2"
            >
              Sign in to Dashboard
            </Button>
          </form>

          {/* Demo */}
          <div className="mt-5 pt-5 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 mb-2">Demo credentials:</p>
            <div className="bg-zinc-900/50 rounded-lg p-3 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Email</span>
                <span className="text-zinc-300">uhaimong.me@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pass</span>
                <span className="text-zinc-300">Admin@885</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-zinc-700 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin access only.
          Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};
