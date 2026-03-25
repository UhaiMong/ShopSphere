import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../../hooks";
import { Button, Input } from "../../components/ui";
// import { cn } from '../../utils';
import toast from "react-hot-toast";

// ─── Shared Auth Shell ────────────────────────────────────────────────────────
const AuthShell = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
}) => (
  <div className="min-h-screen flex">
    {/* Left panel — decorative */}
    <div className="hidden lg:flex lg:w-1/2 bg-stone-950 relative overflow-hidden flex-col items-center justify-center p-16">
      {/* Abstract shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/10" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-brand-400/8" />
        <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-stone-800/60" />
      </div>

      <div className="relative z-10 max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 mb-16">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-2xl font-bold text-white"
          >
            Shop<span className="text-brand-400">Sphere</span>
          </span>
        </Link>

        <blockquote className="space-y-6">
          <p
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-3xl font-bold text-white leading-tight"
          >
            Your one-stop shop for{" "}
            <span className="text-brand-400">everything you need.</span>
          </p>
          <p className="text-stone-400 leading-relaxed">
            Discover thousands of quality products, seamless checkout, and fast
            delivery — all in one place.
          </p>
        </blockquote>

        {/* Floating stat cards */}
        <div className="mt-12 grid grid-cols-2 gap-3">
          {[
            { label: "Products", value: "10,000+" },
            { label: "Customers", value: "50,000+" },
            { label: "Orders Delivered", value: "200,000+" },
            { label: "Avg. Rating", value: "4.8 ★" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-4 border border-stone-700/50"
            >
              <p
                style={{ fontFamily: "Syne, sans-serif" }}
                className="text-xl font-bold text-white"
              >
                {stat.value}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right panel — form */}
    <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-stone-25">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-xl font-bold text-stone-900"
          >
            Shop<span className="text-brand-500">Sphere</span>
          </span>
        </Link>

        <div className="mb-8">
          <h1
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-3xl font-bold text-stone-900 mb-2"
          >
            {title}
          </h1>
          <div className="text-stone-500 text-sm">{subtitle}</div>
        </div>

        {children}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
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
          placeholder="you@example.com"
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

        {/* Demo credentials */}
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 space-y-1">
          <p className="font-semibold">Demo credentials:</p>
          <p>📧 user@shopsphere.com</p>
          <p>🔑 User@123456</p>
        </div>
      </form>
    </AuthShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
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
          placeholder="John Doe"
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
          placeholder="you@example.com"
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

// Imports needed for action type matching
import { login } from "../../features/auth/authSlice";
import { register as registerAction } from "../../features/auth/authSlice";
import { cn } from "@/uitls";
