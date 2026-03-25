import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCcw,
  Package,
} from "lucide-react";
// import { apiGet, apiPatch } from '../../services/api';
import {
  Button,
  Badge,
  Select,
  Pagination,
  PageHeader,
  SearchInput,
  SkeletonRow,
  EmptyState,
  Modal,
} from "../../components/ui";
import { OrderStatusBadge } from "../../components/layout";
// import { formatPrice, formatDate, formatDateTime, timeAgo, cn } from '../../utils';
// import type { Order, OrderStatus, PaginatedResponse } from '../../types';
import toast from "react-hot-toast";
import { apiGet, apiPatch } from "@/services/api";
import { cn, formatDate, formatDateTime, formatPrice, timeAgo } from "@/utils";
import { Order, OrderStatus, PaginatedResponse } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// Orders List
export const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const p: Record<string, unknown> = { page, limit: 20 };
        if (statusFilter) p.status = statusFilter;
        if (paymentFilter) p["payment.status"] = paymentFilter;
        // search by orderNumber handled server-side if supported

        const res = await apiGet<PaginatedResponse<Order>>(
          `/admin/orders?${new URLSearchParams(p as any)}`,
        );
        const data = (res as any).data ?? [];
        const pagi = (res as any).pagination ?? {
          page: 1,
          totalPages: 1,
          total: 0,
          limit: 20,
        };

        // Client-side search filter if server doesn't support it
        const filtered = search
          ? data.filter(
              (o: Order) =>
                o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                (typeof o.user === "object" &&
                  (o.user.name.toLowerCase().includes(search.toLowerCase()) ||
                    o.user.email.toLowerCase().includes(search.toLowerCase()))),
            )
          : data;

        setOrders(filtered);
        setPagination(pagi);
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, paymentFilter, search],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${pagination.total} total orders`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Order # or customer..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none"
        >
          <option value="">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} cols={8} />
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="No orders found" />
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const user =
                    typeof order.user === "object" ? order.user : null;
                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="cursor-pointer"
                    >
                      <td>
                        <span className="font-mono text-xs text-orange-400">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td>
                        <p className="text-xs font-medium text-zinc-200">
                          {user?.name ?? "—"}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {user?.email ?? ""}
                        </p>
                      </td>
                      <td>
                        <span className="text-xs text-zinc-400">
                          {timeAgo(order.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-zinc-300">
                          {order.items.reduce(
                            (s: any, i: any) => s + i.quantity,
                            0,
                          )}{" "}
                          items
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-zinc-200">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td>
                        <Badge
                          color={
                            order.payment.status === "paid"
                              ? "green"
                              : order.payment.status === "failed"
                                ? "red"
                                : "yellow"
                          }
                        >
                          {order.payment.status}
                        </Badge>
                      </td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Link to={`/orders/${order._id}`}>
                          <Button variant="ghost" size="xs">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={(p) => void load(p)}
          />
        )}
      </div>
    </div>
  );
};

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
