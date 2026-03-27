import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { apiGet } from "@/services/api";
import { formatPrice, timeAgo } from "@/utils";
import { Order, OrderStatus, PaginatedResponse } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState, SkeletonRow } from "@/components/ui/SkeletonRow";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusBadge } from "@/components/layout/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

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
