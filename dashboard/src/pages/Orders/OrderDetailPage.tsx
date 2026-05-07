import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCcw,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiGet, apiPatch } from "@/services/api";
import { cn, formatDate, formatDateTime, formatPrice } from "@/utils";
import { Order, OrderStatus } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrderStatusBadge } from "@/components/layout/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// Order Detail
const TIMELINE_ICONS: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: RefreshCcw,
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [statusNote, setStatusNote] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await apiGet<{ data: Order }>(`/admin/orders/${id}`);
    const o = (res as any).data as Order;
    setOrder(o);
    setNewStatus(o.status);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      await apiPatch(`/admin/orders/${order._id}/status`, {
        status: newStatus,
        note: statusNote,
      });
      toast.success(`Status updated to ${newStatus}`);
      setShowStatusModal(false);
      setStatusNote("");
      void load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!order) return null;

  const user = typeof order.user === "object" ? order.user : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-zinc-600 mb-5">
        <Link to="/orders" className="hover:text-zinc-300">
          Orders
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-orange-400 font-mono">{order.orderNumber}</span>
      </div>

      <PageHeader
        title={order.orderNumber}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex gap-2 items-center">
            <OrderStatusBadge status={order.status} />
            <Button size="sm" onClick={() => setShowStatusModal(true)}>
              Update Status
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items + Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="card">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-100">Items</p>
              <span className="text-xs text-zinc-500">
                {order.items.reduce((s: any, i: any) => s + i.quantity, 0)}{" "}
                items
              </span>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {order.items.map((item: any, i: any) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-200">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      ×{item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>
                  {order.shippingFee === 0
                    ? "Free"
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-zinc-100 text-sm pt-2 border-t border-zinc-800">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-zinc-100 mb-4">
              Order Timeline
            </p>
            <div className="space-y-4">
              {[...order.timeline].reverse().map((event, i) => {
                const Icon = TIMELINE_ICONS[event.status] ?? Package;
                return (
                  <div key={i} className="flex gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        i === 0
                          ? "bg-orange-500/10 text-orange-400"
                          : "bg-zinc-800 text-zinc-500",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-xs font-medium capitalize",
                          i === 0 ? "text-zinc-100" : "text-zinc-500",
                        )}
                      >
                        {event.status}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {formatDateTime(event.timestamp)}
                      </p>
                      {event.note && (
                        <p className="text-[10px] text-zinc-500 mt-0.5 italic">
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
          {/* Customer */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Customer
            </p>
            {user ? (
              <div className="space-y-1.5 text-xs">
                <p className="font-medium text-zinc-100">{user.name}</p>
                <p className="text-zinc-500">{user.email}</p>
                {user.phone && <p className="text-zinc-500">{user.phone}</p>}
                <Link
                  to={`/users/${user._id}`}
                  className="text-orange-400 hover:underline text-[11px]"
                >
                  View profile →
                </Link>
              </div>
            ) : (
              <p className="text-xs text-zinc-600">Guest order</p>
            )}
          </div>

          {/* Shipping */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Shipping Address
            </p>
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p className="text-zinc-200 font-medium">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Payment
            </p>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Method</span>
                <span className="text-zinc-200 capitalize">
                  {order.payment.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <Badge
                  color={order.payment.status === "paid" ? "green" : "yellow"}
                >
                  {order.payment.status}
                </Badge>
              </div>
              {order.payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Txn ID</span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
              {order.payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Paid at</span>
                  <span className="text-zinc-300">
                    {formatDate(order.payment.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            options={STATUSES.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Note (optional)
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
              placeholder="Add a note for the customer or internal reference..."
              className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={updatingStatus}
              onClick={handleStatusUpdate}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
