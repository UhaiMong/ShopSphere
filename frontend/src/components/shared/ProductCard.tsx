import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/currency";
import { StarRating } from "../ui/StarRating";
import { PageLoader } from "../ui/PageLoader";
import { cn } from "@/utils/cn";
import { Badge } from "../ui/Badge";
import { Product } from "@/types/typeProduct";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { getDiscountPercent } from "@/utils/product";
import { addToCart } from "@/features/cart/cartSlice";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const isWishlisted = isInWishlist(product._id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAddingToCart) return;

    setIsAddingToCart(true);
    const result = await addItem(product._id, 1);
    setIsAddingToCart(false);

    if (addToCart.fulfilled.match(result)) {
      toast.success("Added to cart!", { icon: "🛍️" });
      openCart();
    } else {
      toast.error(String(result.payload) ?? "Failed to add to cart");
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Sign in to save items to your wishlist");
      return;
    }
    await toggleWishlist(product._id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  const imageUrl = imgError
    ? `https://placehold.co/400x400/f5f0eb/a8a09a?text=${encodeURIComponent(product.name.slice(0, 2))}`
    : (product.thumbnail ?? product.images?.[0]);

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl border border-stone-100 overflow-hidden",
        "hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/80",
        "transition-all duration-300",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={imageUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <Badge variant="danger" size="sm">
              {discount}% off
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="brand" size="sm">
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="neutral" size="sm">
              Out of stock
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/90 backdrop-blur-sm shadow-sm",
            "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
            "transition-all duration-200",
            isWishlisted ? "text-red-500" : "text-stone-400 hover:text-red-400",
          )}
        >
          <Heart
            className="w-4 h-4"
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* Quick add button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={cn(
              "absolute bottom-3 left-3 right-3",
              "flex items-center justify-center gap-2",
              "bg-stone-900/90 backdrop-blur-sm text-white text-xs font-medium",
              "py-2.5 rounded-xl",
              "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
              "transition-all duration-200",
              "hover:bg-stone-900",
            )}
          >
            {isAddingToCart ? (
              <PageLoader />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            {isAddingToCart ? "Adding..." : "Quick add"}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        {product.brand && (
          <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">
            {product.brand}
          </span>
        )}

        <h3 className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {product.avgRating > 0 && (
          <StarRating
            rating={product.avgRating}
            reviewCount={product.reviewCount}
          />
        )}

        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="font-semibold text-stone-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-stone-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
