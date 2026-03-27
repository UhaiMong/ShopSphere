// WISHLIST PAGE
import { useEffect, useState } from "react";
import { ProductCard } from "../../components/shared/ProductCard";
import { Heart, ArrowRight } from "lucide-react";

import api from "@/services/app";
import { useWishlist } from "@/hooks/useWishlist";
import { Product } from "@/types/typeProduct";
import { SkeletonProductCard } from "@/components/ui/SkeletonLine";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export const WishlistPage = () => {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void api
      .get<{ data: { products: Product[] } }>("/wishlist")
      .then(({ data }) => {
        setProducts(data.data.products);
        setIsLoading(false);
      });
  }, [wishlistIds]);

  return (
    <div className="container-app py-10">
      <h1
        style={{ fontFamily: "Syne, sans-serif" }}
        className="text-3xl font-bold text-stone-900 mb-8"
      >
        My Wishlist
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-14 h-14" />}
          title="Your wishlist is empty"
          description="Save products you love and come back to them anytime."
          action={
            <Link to="/products">
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Products
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
          {products.map((p, i) => (
            <div
              key={p._id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
