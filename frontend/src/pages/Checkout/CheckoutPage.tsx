import { useForm } from "react-hook-form";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { selectCart } from "../../features/cart/cartSlice";
import api from "@/services/app";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/utils/currency";
import { Button } from "@/components/ui/Button";

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
                    className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer has-checked:border-brand-500 transition-all"
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
