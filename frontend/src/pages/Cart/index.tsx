import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, Tag } from "lucide-react";
// import { useCart } from '../../hooks';
import { ProductCard } from "../../components/shared/ProductCard";
import {
  Button,
  QuantitySelector,
  EmptyState,
  Spinner,
  SkeletonProductCard,
} from "../../components/ui";
// import { formatPrice } from '../../utils';
import toast from "react-hot-toast";
// import api from '../../services/api';
import type { Product } from "../../types";

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

  // if (isLoading) {
  //   return (
  //     <div className="container-app py-10 flex items-center justify-center min-h-[50vh]">
  //       <Spinner size="lg" />
  //     </div>
  //   );
  // }

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

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT PAGE
// ─────────────────────────────────────────────────────────────────────────────
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { selectCart } from "../../features/cart/cartSlice";
import { formatPrice } from "@/uitls";
import api from "@/services/app";
import { useCart } from "@/hooks";

interface CheckoutForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  paymentMethod: "stripe" | "sslcommerz" | "cod";
  notes?: string;
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const cart = useAppSelector(selectCart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAddress =
    user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      fullName: defaultAddress?.fullName ?? user?.name ?? "",
      phone: defaultAddress?.phone ?? user?.phone ?? "",
      addressLine1: defaultAddress?.addressLine1 ?? "",
      addressLine2: defaultAddress?.addressLine2 ?? "",
      city: defaultAddress?.city ?? "",
      postalCode: defaultAddress?.postalCode ?? "",
      country: defaultAddress?.country ?? "BD",
      paymentMethod: "cod",
    },
  });

  if (!cart || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    try {
      const { data: res } = await api.post<{
        data: { _id: string; orderNumber: string };
      }>("/orders", {
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      });
      toast.success(`Order ${res.data.orderNumber} placed! 🎉`);
      navigate(`/orders/${res.data._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-app py-10">
      <h1
        style={{ fontFamily: "Syne, sans-serif" }}
        className="text-3xl font-bold text-stone-900 mb-8"
      >
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Shipping + Payment */}
          <div className="flex-1 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-5">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    error={errors.fullName?.message}
                    {...register("fullName", { required: "Required" })}
                  />
                  <Input
                    label="Phone"
                    error={errors.phone?.message}
                    {...register("phone", { required: "Required" })}
                  />
                </div>
                <Input
                  label="Address Line 1"
                  error={errors.addressLine1?.message}
                  {...register("addressLine1", { required: "Required" })}
                />
                <Input
                  label="Address Line 2 (optional)"
                  {...register("addressLine2")}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="City"
                    error={errors.city?.message}
                    {...register("city", { required: "Required" })}
                  />
                  <Input label="State / Division" {...register("state")} />
                  <Input
                    label="Postal Code"
                    error={errors.postalCode?.message}
                    {...register("postalCode", { required: "Required" })}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-5">
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "cod",
                    label: "Cash on Delivery",
                    desc: "Pay when your order arrives",
                  },
                  {
                    value: "sslcommerz",
                    label: "SSLCommerz",
                    desc: "bKash, Nagad, Card via SSLCommerz",
                  },
                  {
                    value: "stripe",
                    label: "Stripe",
                    desc: "Credit / debit card via Stripe",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 transition-all"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register("paymentMethod")}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        {opt.label}
                      </p>
                      <p className="text-xs text-stone-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Order Notes (optional)
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Special instructions for your order..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-20">
              <h2 className="font-semibold text-stone-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-50 shrink-0">
                      <img
                        src={item.product.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-700 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-stone-400">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-medium text-stone-900 shrink-0">
                      {formatPrice(item.priceSnapshot * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-900 text-base pt-1 border-t border-stone-100">
                  <span>Total</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-5"
                isLoading={isSubmitting}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
