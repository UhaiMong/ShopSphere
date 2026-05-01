import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "./AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { login } from "@/features/auth/authSlice";

// LOGIN PAGE
interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    const result = await signIn(data);
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back! 👋");
      navigate(from, { replace: true });
    } else {
      toast.error(String(result.payload) ?? "Login failed");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <>
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-brand-600 font-medium hover:underline"
          >
            Sign up free
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="username@domain.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email address",
            },
          })}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-brand-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                "w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border transition-colors bg-white",
                "placeholder:text-stone-400 text-stone-900",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
                errors.password
                  ? "border-red-300"
                  : "border-stone-200 hover:border-stone-300",
              )}
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
};
