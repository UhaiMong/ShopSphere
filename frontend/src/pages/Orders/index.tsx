import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
// import api from '../../services/api';
import type { Order, OrderStatus } from "../../types";
import { Button, Badge, EmptyState, Spinner } from "../../components/ui";
// import { formatPrice, formatDateTime, formatDate, cn } from '../../utils';
import api from "@/services/app";
import { cn, formatDate, formatDateTime, formatPrice } from "@/uitls";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: "neutral" | "brand" | "success" | "warning" | "danger";
    icon: React.ElementType;
  }
> = {
  pending: { label: "Pending", color: "neutral", icon: Clock },
  confirmed: { label: "Confirmed", color: "brand", icon: CheckCircle2 },
  processing: { label: "Processing", color: "brand", icon: Package },
  shipped: { label: "Shipped", color: "warning", icon: Truck },
  delivered: { label: "Delivered", color: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "danger", icon: XCircle },
  refunded: { label: "Refunded", color: "danger", icon: RefreshCcw },
};

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return <Badge variant={cfg.color}>{cfg.label}</Badge>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    void api.get<{ data: Order[] }>(`/orders${params}`).then(({ data }) => {
      setOrders(data.data);
      setIsLoading(false);
    });
  }, [statusFilter]);

  return (
    <div className="container-app py-10">
      <h1
        style={{ fontFamily: "Syne, sans-serif" }}
        className="text-3xl font-bold text-stone-900 mb-8"
      >
        My Orders
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {[
          "all",
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              statusFilter === s
                ? "bg-brand-500 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200",
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-14 h-14" />}
          title="No orders yet"
          description="Your order history will appear here"
          action={
            <Link to="/products">
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Shopping
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-stone-200 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50 bg-stone-25 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Order</p>
                    <p className="text-sm font-semibold text-stone-900">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Placed</p>
                    <p className="text-sm text-stone-700">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Total</p>
                    <p className="text-sm font-semibold text-stone-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items preview */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-stone-50 shrink-0"
                        style={{ zIndex: 3 - i }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl border-2 border-white bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 line-clamp-1">
                      {order.items.map((i) => i.name).join(", ")}
                    </p>
                    <p className="text-xs text-stone-400">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </p>
                  </div>
                  <Link to={`/orders/${order._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    void api.get<{ data: Order }>(`/orders/${id}`).then(({ data }) => {
      setOrder(data.data);
      setIsLoading(false);
    });
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setIsCancelling(true);
    try {
      const { data } = await api.patch<{ data: Order }>(
        `/orders/${order._id}/cancel`,
      );
      setOrder(data.data);
      // toast handled here if needed
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!order) return null;

  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="container-app py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-6">
        <Link to="/orders" className="hover:text-stone-700">
          Orders
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-stone-600">{order.orderNumber}</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-2xl font-bold text-stone-900"
          >
            {order.orderNumber}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-50">
              <h2 className="font-semibold text-stone-900">Items Ordered</h2>
            </div>
            <div className="divide-y divide-stone-50">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 p-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm line-clamp-2">
                      {item.name}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="text-xs text-stone-500 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-stone-900 shrink-0 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-stone-25 border-t border-stone-100 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span>
                  {order.shippingFee === 0
                    ? "Free"
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 text-base pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-semibold text-stone-900 mb-5">
              Order Timeline
            </h2>
            <div className="space-y-4">
              {[...order.timeline].reverse().map((event, i) => {
                const cfg = STATUS_CONFIG[event.status];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        i === 0
                          ? "bg-brand-50 text-brand-500"
                          : "bg-stone-50 text-stone-400",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          i === 0 ? "text-stone-900" : "text-stone-500",
                        )}
                      >
                        {cfg.label}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatDateTime(event.timestamp)}
                      </p>
                      {event.note && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-semibold text-stone-900 mb-3">
              Shipping Address
            </h2>
            <div className="text-sm text-stone-600 space-y-0.5">
              <p className="font-medium text-stone-800">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-semibold text-stone-900 mb-3">Payment</h2>
            <div className="text-sm text-stone-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-stone-800 capitalize">
                  {order.payment.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge
                  variant={
                    order.payment.status === "paid" ? "success" : "neutral"
                  }
                  size="sm"
                >
                  {order.payment.status}
                </Badge>
              </div>
              {order.payment.transactionId && (
                <div className="flex justify-between">
                  <span>Txn ID</span>
                  <span className="font-mono text-xs text-stone-500">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
