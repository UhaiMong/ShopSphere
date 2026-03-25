import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingCart, Trash2, ArrowRight, PackageOpen } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeCart, selectIsCartOpen } from "../../features/ui/uiSlice";
import { Button, QuantitySelector, Spinner } from "../ui";
import toast from "react-hot-toast";

export const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsCartOpen);
  const { cart, isMutating, updateItem, removeItem, loadCart } = useCart();

  // Load cart when opened
  useEffect(() => {
    if (isOpen) void loadCart();
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleRemove = async (itemId: string, name: string) => {
    const result = await removeItem(itemId);
    if (removeCartItem.fulfilled.match(result)) {
      toast.success(`${name} removed`);
    }
  };

  const handleUpdateQty = async (itemId: string, qty: number) => {
    await updateItem(itemId, qty);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => dispatch(closeCart())}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-stone-700" />
            <h2
              style={{ fontFamily: "Syne, sans-serif" }}
              className="text-lg font-bold text-stone-900"
            >
              Cart
              {(cart?.itemCount ?? 0) > 0 && (
                <span className="ml-2 text-sm font-normal text-stone-400">
                  ({cart?.itemCount} {cart?.itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {isMutating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          )}

          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              <div className="w-20 h-20 rounded-2xl bg-stone-50 flex items-center justify-center">
                <PackageOpen className="w-9 h-9 text-stone-300" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-stone-800 mb-1">
                  Your cart is empty
                </p>
                <p className="text-sm text-stone-400">
                  Add items to get started
                </p>
              </div>
              <Button
                onClick={() => dispatch(closeCart())}
                variant="secondary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-stone-50 px-6">
              {cart.items.map((item) => (
                <li key={item._id} className="py-5 flex gap-4">
                  {/* Image */}
                  <Link
                    to={`/products/${item.product.slug}`}
                    onClick={() => dispatch(closeCart())}
                    className="shrink-0"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                      <img
                        src={item.product.thumbnail ?? item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product.slug}`}
                      onClick={() => dispatch(closeCart())}
                      className="text-sm font-medium text-stone-900 hover:text-brand-600 line-clamp-2 leading-snug"
                    >
                      {item.product.name}
                    </Link>
                    {item.variantLabel && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {item.variantLabel}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <QuantitySelector
                        value={item.quantity}
                        min={1}
                        max={item.product.stock}
                        onChange={(qty) => handleUpdateQty(item._id, qty)}
                        disabled={isMutating}
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {formatPrice(item.priceSnapshot * item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            handleRemove(item._id, item.product.name)
                          }
                          disabled={isMutating}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Shipping</span>
                <span className="text-green-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="text-lg">{formatPrice(cart.subtotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link to="/checkout" onClick={() => dispatch(closeCart())}>
                <Button
                  fullWidth
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Checkout
                </Button>
              </Link>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-full text-sm text-stone-500 hover:text-stone-700 transition-colors py-1"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Import needed for match check
import { removeCartItem } from "../../features/cart/cartSlice";
import { useCart } from "@/hooks";
import { cn, formatPrice } from "@/uitls";
