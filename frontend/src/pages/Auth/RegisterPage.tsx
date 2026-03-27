import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "./AuthShell";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { register as registerAction } from "@/features/auth/authSlice";

// REGISTER PAGE
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    const result = await signUp({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (registerAction.fulfilled.match(result)) {
      toast.success("Account created! Please check your email to verify.");
      navigate("/auth/login");
    } else {
      toast.error(String(result.payload) ?? "Registration failed");
    }
  };

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthColors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-yellow-400",
    "bg-green-500",
  ];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <AuthShell
      title="Create account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-brand-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Uhai Mong"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="uhaimong.me@gmail.com"
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
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className={cn(
                "w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border transition-colors bg-white",
                "placeholder:text-stone-400 text-stone-900",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
                errors.password
                  ? "border-red-300"
                  : "border-stone-200 hover:border-stone-300",
              )}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "At least 8 characters required",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Must contain uppercase, lowercase, and a number",
                },
              })}
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
          {/* Strength meter */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i <= passwordStrength
                        ? strengthColors[passwordStrength]
                        : "bg-stone-200",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-400">
                {strengthLabels[passwordStrength]}
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (v) => v === password || "Passwords do not match",
          })}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          className="mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create account
        </Button>

        <p className="text-xs text-stone-400 text-center">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-stone-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-stone-600">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </AuthShell>
  );
};
