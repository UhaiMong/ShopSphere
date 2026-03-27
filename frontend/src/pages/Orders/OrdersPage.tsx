import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, ArrowRight, Badge } from "lucide-react";

import api from "@/services/app";
import { STATUS_CONFIG } from "./STATUS_CONFIG";
import { Order, OrderStatus } from "@/types/typeOrder";
import { cn } from "@/utils/cn";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/dateTime";
import { formatPrice } from "@/utils/currency";

// Order status badge
const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return <Badge fontVariant={cfg.color}>{cfg.label}</Badge>;
};

// ORDERS LIST PAGE
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
        <PageLoader title="Order is loading..." />
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
