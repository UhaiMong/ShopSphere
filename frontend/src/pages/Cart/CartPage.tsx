import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/utils/currency";
import { QuantitySelector } from "@/components/ui/QuantitySelector";

export const CartPage = () => {
  const { cart, isMutating, loadCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    void loadCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId);
    toast.success("Item removed");
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={<ShoppingCart className="w-14 h-14" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Link to="/products">
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Products
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1
        style={{ fontFamily: "Syne, sans-serif" }}
        className="text-3xl font-bold text-stone-900 mb-8"
      >
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 bg-white rounded-2xl border border-stone-100 p-4"
              >
                <Link
                  to={`/products/${item.product.slug}`}
                  className="shrink-0"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-50">
                    <img
                      src={item.product.thumbnail ?? item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-medium text-stone-900 hover:text-brand-600 line-clamp-2 text-sm leading-snug"
                  >
                    {item.product.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.variantLabel}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-stone-900 mt-2">
                    {formatPrice(item.priceSnapshot)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <QuantitySelector
                      value={item.quantity}
                      max={item.product.stock}
                      onChange={(q) => void updateItem(item._id, q)}
                      disabled={isMutating}
                    />
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-stone-900">
                        {formatPrice(item.priceSnapshot * item.quantity)}
                      </span>
                      <button
                        onClick={() => void handleRemove(item._id)}
                        className="text-stone-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-20">
            <h2 className="font-semibold text-stone-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold text-stone-900">
                <span>Total</span>
                <span className="text-lg">{formatPrice(cart.subtotal)}</span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => navigate("/checkout")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>

            <Link
              to="/products"
              className="block text-center text-sm text-stone-400 hover:text-stone-600 mt-3 transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
