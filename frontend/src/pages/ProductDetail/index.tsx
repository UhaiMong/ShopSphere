import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
// import api from '../../services/api';
import type { Product, Review, ProductVariant } from "../../types";
import { ProductCard } from "../../components/shared/ProductCard";
import {
  Button,
  Badge,
  StarRating,
  SkeletonLine,
  Spinner,
} from "../../components/ui";
import { useCart, useWishlist, useAuth } from "../../hooks";
// import { formatPrice, getDiscountPercent, timeAgo, cn } from '@utils';
import toast from "react-hot-toast";
import api from "@/services/app";
import { cn, formatPrice, getDiscountPercent, timeAgo } from "@/uitls";

// ─── Image Gallery ────────────────────────────────────────────────────────────
const ImageGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                i === active
                  ? "border-brand-500"
                  : "border-stone-100 hover:border-stone-200",
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Review Item ──────────────────────────────────────────────────────────────
const ReviewItem = ({ review }: { review: Review }) => (
  <div className="py-5 border-b border-stone-100 last:border-0">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
        {review.user.avatar ? (
          <img
            src={review.user.avatar}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-brand-600">
            {review.user.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-sm font-semibold text-stone-800">
              {review.user.name}
            </span>
            {review.isVerifiedPurchase && (
              <span className="ml-2 text-xs text-green-600 font-medium flex-inline items-center gap-0.5">
                <Check className="w-3 h-3 inline" /> Verified Purchase
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400">
            {timeAgo(review.createdAt)}
          </span>
        </div>
        <StarRating rating={review.rating} showCount={false} size="sm" />
        {review.title && (
          <p className="font-medium text-stone-800 text-sm mt-1">
            {review.title}
          </p>
        )}
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          {review.body}
        </p>
        {review.helpfulCount > 0 && (
          <p className="text-xs text-stone-400 mt-2">
            {review.helpfulCount} people found this helpful
          </p>
        )}
      </div>
    </div>
  </div>
);

// ─── Product Detail Page ──────────────────────────────────────────────────────
export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Selected variant & quantity
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description",
  );

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    void api
      .get<{ data: Product }>(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.data);
        setIsLoading(false);
        // Load related and reviews in parallel
        void api
          .get<{ data: Product[] }>(`/products/${data.data._id}/related`)
          .then((r) => setRelated(r.data.data));
        void api
          .get<{ data: Review[] }>(`/reviews/${data.data._id}?limit=10`)
          .then((r) => setReviews(r.data.data));
      })
      .catch(() => {
        setIsLoading(false);
        navigate("/404");
      });
  }, [slug, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }
    setIsAddingToCart(true);
    const result = await addItem(product._id, quantity, selectedVariant?._id);
    setIsAddingToCart(false);
    if ((result as any).error) {
      toast.error((result.payload as string) ?? "Failed to add to cart");
    } else {
      toast.success("Added to cart!", { icon: "🛍️" });
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Sign in to save items");
      return;
    }
    await toggleWishlist(product._id);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container-app py-10">
        <div className="flex gap-12 flex-col lg:flex-row">
          <div className="lg:w-1/2 space-y-3">
            <div className="skeleton aspect-square rounded-2xl w-full" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton w-16 h-16 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 space-y-4">
            <SkeletonLine className="h-5 w-24" />
            <SkeletonLine className="h-8 w-full" />
            <SkeletonLine className="h-8 w-3/4" />
            <SkeletonLine className="h-6 w-32" />
            <SkeletonLine className="h-24 w-full" />
            <SkeletonLine className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = isInWishlist(product._id);
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = activeStock === 0;
  const activePrice = selectedVariant?.price ?? product.price;

  // Group variants by attribute
  const colors = [
    ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
  ];
  const sizes = [
    ...new Set(product.variants.map((v) => v.size).filter(Boolean)),
  ];

  return (
    <div className="container-app py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-6">
        <Link to="/" className="hover:text-stone-700">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-stone-700">
          Products
        </Link>
        {product.category && typeof product.category === "object" && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-stone-700"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-stone-600 truncate max-w-40">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Images */}
        <div className="lg:w-[45%]">
          <ImageGallery
            images={
              product.images.length
                ? product.images
                : ["https://placehold.co/600x600/f5f0eb/a8a09a?text=No+Image"]
            }
            name={product.name}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">
              {product.brand}
            </p>
          )}

          <h1
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-3xl font-bold text-stone-900 mb-3 leading-tight"
          >
            {product.name}
          </h1>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <StarRating
                rating={product.avgRating}
                reviewCount={product.reviewCount}
                size="md"
              />
              <button
                onClick={() => setActiveTab("reviews")}
                className="text-xs text-brand-600 hover:underline"
              >
                See all reviews
              </button>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-stone-900">
              {formatPrice(activePrice)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {discount > 0 && <Badge variant="danger">{discount}% off</Badge>}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              {product.shortDescription}
            </p>
          )}

          {/* Color Variants */}
          {colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-stone-700 mb-2">
                Color:{" "}
                <span className="font-normal text-stone-500">
                  {selectedVariant?.color ?? "Select"}
                </span>
              </p>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setSelectedVariant(
                        product.variants.find((v) => v.color === color) ?? null,
                      )
                    }
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-sm border-2 transition-all",
                      selectedVariant?.color === color
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-stone-200 text-stone-600 hover:border-stone-300",
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-stone-700 mb-2">
                Size:{" "}
                <span className="font-normal text-stone-500">
                  {selectedVariant?.size ?? "Select"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variant = product.variants.find((v) => v.size === size);
                  const outOfStock = (variant?.stock ?? 0) === 0;
                  return (
                    <button
                      key={size}
                      onClick={() =>
                        !outOfStock && setSelectedVariant(variant ?? null)
                      }
                      disabled={outOfStock}
                      className={cn(
                        "w-12 h-12 rounded-xl text-sm border-2 font-medium transition-all",
                        outOfStock &&
                          "opacity-40 cursor-not-allowed line-through",
                        selectedVariant?.size === size
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-stone-200 text-stone-600 hover:border-stone-300",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isOutOfStock ? "bg-red-400" : "bg-green-500",
              )}
            />
            <span className="text-sm text-stone-600">
              {isOutOfStock ? "Out of stock" : `${activeStock} in stock`}
            </span>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-0 rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-3 py-3 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 py-3 text-sm font-semibold text-stone-900 border-x border-stone-200">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                disabled={quantity >= activeStock || isOutOfStock}
                className="px-3 py-3 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={isOutOfStock}
              isLoading={isAddingToCart}
              onClick={handleAddToCart}
              leftIcon={<ShoppingCart className="w-4.5 h-4.5" />}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            <button
              onClick={handleWishlist}
              className={cn(
                "w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600",
              )}
            >
              <Heart
                className="w-5 h-5"
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 py-5 border-t border-stone-100">
            {[
              { icon: Shield, text: "Secure payment" },
              { icon: Truck, text: "Fast delivery" },
              { icon: RotateCcw, text: "Easy returns" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <Icon className="w-5 h-5 text-stone-400" />
                <span className="text-xs text-stone-500">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description + Reviews */}
      <div className="mt-14">
        <div className="flex border-b border-stone-100">
          {(["description", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-stone-500 hover:text-stone-800",
              )}
            >
              {tab}
              {tab === "reviews" && product.reviewCount > 0 && (
                <span className="ml-2 text-xs text-stone-400">
                  ({product.reviewCount})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-3xl">
          {activeTab === "description" ? (
            <div className="prose prose-sm prose-stone max-w-none">
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/products?tags=${tag}`}
                      className="px-3 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {reviews.length === 0 ? (
                <p className="text-stone-400 text-sm">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {reviews.map((r) => (
                    <ReviewItem key={r._id} review={r} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-8 pt-10 border-t border-stone-100">
          <h2
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-2xl font-bold text-stone-900 mb-6"
          >
            You may also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {related.slice(0, 6).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
