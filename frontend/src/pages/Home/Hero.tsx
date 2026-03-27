import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Hero
export const Hero = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <section className="relative overflow-hidden bg-stone-950 text-white">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-175 h-175 rounded-full bg-brand-500/8" />
        <div className="absolute bottom-[-20%] left-[-10%] w-125 h-125 rounded-full bg-brand-400/5" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container-app py-24 lg:py-32 relative z-10">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" fill="currentColor" />
            Free shipping on orders over ৳500
          </div>

          <h1
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] mb-6"
          >
            Discover
            <br />
            <span className="text-brand-400">Everything</span>
            <br />
            You Need.
          </h1>

          <p className="text-stone-400 text-lg leading-relaxed mb-10 max-w-lg">
            Shop thousands of quality products from electronics to fashion — all
            in one modern marketplace with fast delivery.
          </p>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (search.trim())
                navigate(
                  `/products?search=${encodeURIComponent(search.trim())}`,
                );
              else navigate("/products");
            }}
            className="flex gap-2 max-w-lg mb-8"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything..."
              className="flex-1 px-5 py-3.5 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder:text-stone-500 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <Button type="submit" size="lg" className="shrink-0 px-6">
              Search
            </Button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2">
            {["Smartphones", "Laptops", "Men's Fashion", "Audio"].map((tag) => (
              <Link
                key={tag}
                to={`/products?search=${tag}`}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs hover:bg-stone-700 hover:text-white transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
