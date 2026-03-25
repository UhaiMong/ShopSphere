import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
// import { apiGet } from '../../services/api';
import { StatCard, Badge, PageHeader, SkeletonRow } from "../../components/ui";
import { OrderStatusBadge } from "../../components/layout";
// import { formatPrice, formatNumber, formatDate, timeAgo } from '../../utils';
// import type { Order, Product, OrderStatus } from '../../types';
import { apiGet } from "@/services/api";
import { formatNumber, formatPrice, timeAgo } from "@/utils";
import { Order, Product } from "@/types";

// ─── Mock analytics (replace with real API when analytics endpoint exists) ────
const generateRevenueSeries = () =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString("en-BD", { month: "short", day: "numeric" }),
      revenue: Math.round((8000 + Math.random() * 40000) * (1 + i * 0.03)),
      orders: Math.round(20 + Math.random() * 80),
    };
  });

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

// Custom Tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="text-zinc-400 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === "revenue" ? formatPrice(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

export const DashboardPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueSeries] = useState(generateRevenueSeries);

  useEffect(() => {
    Promise.all([
      apiGet<{ data: Order[] }>(
        "/admin/orders?limit=10&sort=createdAt&order=desc",
      ),
      apiGet<{ data: Product[] }>(
        "/products?sort=popular&limit=5&isActive=true",
      ),
    ])
      .then(([ordersRes, productsRes]) => {
        setOrders((ordersRes as any).data ?? []);
        setProducts(
          (productsRes as any).data ?? (productsRes as any).data?.data ?? [],
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Compute quick stats from orders
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === todayStr,
  );
  const todayRevenue = todayOrders
    .filter((o) => o.payment.status === "paid")
    .reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  // Status distribution for pie
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <StatCard
          label="Today's Revenue"
          value={formatPrice(todayRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={12.5}
          color="orange"
          sub={`${todayOrders.length} orders today`}
        />
        <StatCard
          label="Pending Orders"
          value={formatNumber(pendingCount)}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="blue"
          sub="Needs attention"
        />
        <StatCard
          label="Total Products"
          value={formatNumber(products.length)}
          icon={<Package className="w-5 h-5" />}
          trend={3.2}
          color="purple"
        />
        <StatCard
          label="Revenue (14d)"
          value={formatPrice(revenueSeries.reduce((s, d) => s + d.revenue, 0))}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={8.1}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue area chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                Revenue Trend
              </p>
              <p className="text-xs text-zinc-500">Last 14 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={revenueSeries}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${Math.round(v / 100)}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#rev)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-100 mb-1">
            Order Status
          </p>
          <p className="text-xs text-zinc-500 mb-4">Last 10 orders</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#71717a"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: STATUS_COLORS[entry.name] ?? "#71717a",
                        }}
                      />
                      <span className="text-zinc-400 capitalize">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-zinc-300 font-medium">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-zinc-100">Recent Orders</p>
            <Link
              to="/orders"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded ml-auto" />
                  </div>
                ))
              : orders.slice(0, 6).map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {typeof order.user === "object"
                          ? order.user.name
                          : "Customer"}{" "}
                        · {timeAgo(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-zinc-300">
                        {formatPrice(order.total)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-zinc-100">Top Products</p>
            <Link
              to="/products"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="skeleton w-9 h-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-2.5 w-1/3 rounded" />
                    </div>
                  </div>
                ))
              : products.slice(0, 5).map((p, i) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/30 transition-colors"
                  >
                    <span className="text-xs text-zinc-700 font-mono w-4 shrink-0">
                      #{i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                      {p.thumbnail && (
                        <img
                          src={p.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {p.soldCount} sold · {p.stock} left
                        {p.stock < 10 && (
                          <span className="text-amber-400 ml-1">⚠ Low</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-zinc-300 shrink-0">
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};
