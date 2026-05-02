import { Link } from "react-router-dom";
const LOGO = import.meta.env.VITE_LOGO;

// Shared Auth Shell
export const AuthShell = ({
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
        <div className="absolute top-[-20%] right-[-10%] w-150 h-150 rounded-full bg-brand-500/10" />
        <div className="absolute bottom-[-30%] left-[-15%] w-125 h-125 rounded-full bg-brand-400/8" />
        <div className="absolute top-[30%] left-[10%] w-75 h-75 rounded-full bg-stone-800/60" />
      </div>

      <div className="relative z-10 max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 mb-16">
          <div className="w-52 h-auto rounded-lg flex items-center justify-center">
            <img src={LOGO} className="w-full h-full object-cover" alt="Logo" />
          </div>
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
          <div className="w-52 h-auto rounded-lg flex items-center justify-center">
            <img src={LOGO} className="w-full h-full object-cover" />
          </div>
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
