import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/typeProduct";
import { SkeletonProductCard } from "@/components/ui/SkeletonLine";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/Button";

//  Product Section
export const ProductSection = ({
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
