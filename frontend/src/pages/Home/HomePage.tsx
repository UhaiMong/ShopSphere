import { useEffect, useState } from "react";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

import api from "@/services/app";
import { Product } from "@/types/typeProduct";
import { Category } from "@/types/typeCategory";
import { CategoryGrid } from "./CategoryGrid";
import { ProductSection } from "./ProductionSection";
import { CTABanner } from "./CTABanner";
import { HeroSlider } from "./HeroSlider";

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

  return (
    <div>
      <HeroSlider />
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
