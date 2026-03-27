import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatNumber, formatPrice } from "@/utils";
import { DollarSign, ShoppingCart, TrendingUp, UsersIcon } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ANALYTICS PAGE
const genMonthly = () => {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return MONTHS.slice(0, new Date().getMonth() + 1).map((m) => ({
    month: m,
    revenue: Math.round(50000 + Math.random() * 200000),
    orders: Math.round(50 + Math.random() * 300),
    users: Math.round(10 + Math.random() * 100),
  }));
};

const genCategoryRevenue = () => [
  { name: "Electronics", revenue: 450000, orders: 120 },
  { name: "Clothing", revenue: 280000, orders: 340 },
  { name: "Books", revenue: 95000, orders: 480 },
  { name: "Home", revenue: 210000, orders: 95 },
  { name: "Audio", revenue: 175000, orders: 88 },
];

// Analytic page main component
export const AnalyticsPage = () => {
  const [monthly] = useState(genMonthly);
  const [byCat] = useState(genCategoryRevenue);

  const totalRev = monthly.reduce((s, d) => s + d.revenue, 0);
  const totalOrd = monthly.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;

  const ChartTip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-zinc-400 mb-1.5">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}:{" "}
            {p.name === "revenue"
              ? formatPrice(p.value)
              : formatNumber(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Year-to-date overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <StatCard
          label="Total Revenue"
          value={formatPrice(totalRev)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={14.2}
          color="orange"
        />
        <StatCard
          label="Total Orders"
          value={formatNumber(totalOrd)}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={8.7}
          color="blue"
        />
        <StatCard
          label="Avg. Order"
          value={formatPrice(avgOrder)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={5.1}
          color="green"
        />
        <StatCard
          label="Conversion Rate"
          value="3.2%"
          icon={<UsersIcon className="w-5 h-5" />}
          trend={-1.3}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-100 mb-1">
            Monthly Revenue
          </p>
          <p className="text-xs text-zinc-500 mb-4">Year to date</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly} margin={{ left: -20, right: 4, top: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${Math.round(v / 100)}`}
              />
              <Tooltip content={<ChartTip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-100 mb-1">
            Revenue by Category
          </p>
          <p className="text-xs text-zinc-500 mb-4">All time</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={byCat}
              layout="vertical"
              margin={{ left: 0, right: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${Math.round(v / 100)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={75}
              />
              <Tooltip content={<ChartTip />} />
              <Bar
                dataKey="revenue"
                name="revenue"
                fill="#f97316"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <p className="text-sm font-semibold text-zinc-100">
            Monthly Breakdown
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>New Users</th>
                <th>Avg. Order</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.month}>
                  <td className="font-medium text-zinc-200">{row.month}</td>
                  <td className="font-medium text-zinc-200">
                    {formatPrice(row.revenue)}
                  </td>
                  <td>{formatNumber(row.orders)}</td>
                  <td>{formatNumber(row.users)}</td>
                  <td>
                    {formatPrice(
                      row.orders > 0 ? Math.round(row.revenue / row.orders) : 0,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
