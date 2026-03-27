import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Zap,
} from "lucide-react";
import type { Product, Category } from "../../types";
import { ProductCard } from "../../components/shared/ProductCard";
import { SkeletonProductCard, Button } from "../../components/ui";
import api from "@/services/app";
import { cn } from "@/uitls";

// Hero
const Hero = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <section className="relative overflow-hidden bg-stone-950 text-white">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-brand-500/8" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-400/5" />
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

//  Category Grid
const CategoryGrid = ({ categories }: { categories: Category[] }) => {
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

// Value Props
const ValueProps = () => {
  const items = [
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Same-day delivery in Dhaka, 2–5 days nationwide",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      desc: "SSL-encrypted checkout. Pay with card, bKash, or COD",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      desc: "7-day hassle-free returns on all eligible products",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Real humans available every day to help you",
    },
  ];

  return (
    <section className="py-12 bg-stone-50 border-y border-stone-100">
      <div className="container-app">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">{title}</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

//  Product Section
const ProductSection = ({
  title,
  subtitle,
  products,
  isLoading,
  viewAllLink,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading: boolean;
  viewAllLink: string;
}) => (
  <section className="py-16">
    <div className="container-app">
      <div className="flex items-end justify-between mb-8">
        <div>
          {subtitle && (
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">
              {subtitle}
            </p>
          )}
          <h2
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-3xl font-bold text-stone-900"
          >
            {title}
          </h2>
        </div>
        <Link
          to={viewAllLink}
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))
          : products.slice(0, 8).map((p) => (
              <div key={p._id} className="animate-fade-up">
                <ProductCard product={p} />
              </div>
            ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link to={viewAllLink}>
          <Button
            variant="outline"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

//  CTA Banner
const CTABanner = () => (
  <section className="py-8">
    <div className="container-app">
      <div className="relative overflow-hidden rounded-3xl bg-brand-500 text-white px-8 py-12 lg:px-16 lg:py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-5%] w-[400px] h-[400px] rounded-full bg-white/10" />
          <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 max-w-xl">
          <p className="text-brand-100 text-sm font-medium mb-2">
            Limited time offer
          </p>
          <h2
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-3xl lg:text-4xl font-extrabold mb-4"
          >
            Get 15% off your first order
          </h2>
          <p className="text-brand-100 mb-8 leading-relaxed">
            Sign up today and use code{" "}
            <strong className="text-white">WELCOME15</strong> at checkout. Terms
            apply.
          </p>
          <Link to="/auth/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-brand-600 hover:bg-brand-50"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

//  Home Page
export const HomePage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isPopularLoading, setIsPopularLoading] = useState(true);

  useEffect(() => {
    void api
      .get<{ data: Category[] }>("/categories")
      .then(({ data }) => setCategories(data.data));

    void api
      .get<{ data: Product[] }>("/products/featured?limit=8")
      .then(({ data }) => {
        setFeatured(data.data);
        setIsFeaturedLoading(false);
      });

    void api
      .get<{ data: Product[] }>("/products?sort=popular&limit=8")
      .then(({ data }) => {
        setPopular(data.data ?? data.data);
        setIsPopularLoading(false);
      })
      .catch(() => setIsPopularLoading(false));
  }, []);

  console.log("Featured: ", featured, "Popular: ", "Categories: ", categories);

  return (
    <div>
      <Hero />
      <ValueProps />
      <CategoryGrid categories={categories} />
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked"
        products={featured}
        isLoading={isFeaturedLoading}
        viewAllLink="/products?isFeatured=true"
      />
      <CTABanner />
      <ProductSection
        title="Best Sellers"
        subtitle="Most popular"
        products={popular}
        isLoading={isPopularLoading}
        viewAllLink="/products?sort=popular"
      />
    </div>
  );
};
