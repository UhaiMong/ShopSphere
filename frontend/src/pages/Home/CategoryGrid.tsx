import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types/typeCategory";
import { cn } from "@/utils/cn";

//  Category Grid
export const CategoryGrid = ({ categories }: { categories: Category[] }) => {
  const rootCats = categories
    .filter((c) => !c.parent && c.isActive)
    .slice(0, 6);

  return (
    <section className="py-16">
      <div className="container-app">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">
              Browse
            </p>
            <h2
              style={{ fontFamily: "Syne, sans-serif" }}
              className="text-3xl font-bold text-stone-900"
            >
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {rootCats.map((cat, i) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-stone-900 text-white",
                "flex flex-col items-center justify-center gap-2.5 py-8",
                "hover:scale-[1.02] transition-all duration-300 cursor-pointer",
                "border border-stone-800 hover:border-brand-500/40",
                "animate-fade-up",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-3xl">{cat.icon ?? "🛍️"}</span>
              <span className="text-sm font-medium text-center px-2 leading-tight">
                {cat.name}
              </span>
              <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
