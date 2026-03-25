import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ShieldCheck,
  ShieldOff,
  Ban,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users as UsersIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Button,
  Badge,
  Pagination,
  PageHeader,
  SearchInput,
  SkeletonRow,
  EmptyState,
  ConfirmDialog,
  Input,
  Modal,
  StatCard,
} from "../../components/ui";

import {
  useAppSelector,
  useAppDispatch,
  selectAdmin,
  adminLogout,
} from "../../app/store";
import toast from "react-hot-toast";
import api, { apiGet, apiPatch, apiPost, apiPut } from "@/services/api";
import { formatDate, formatNumber, formatPrice, timeAgo } from "@/utils";
import { Category, PaginatedResponse, User } from "@/types";

// USERS PAGE

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionUser, setActionUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const load = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const p: Record<string, string> = { page: String(page), limit: "20" };
        if (search) p.search = search;
        if (roleFilter) p.role = roleFilter;
        const res = await apiGet<PaginatedResponse<User>>(
          `/admin/users?${new URLSearchParams(p)}`,
        );
        setUsers((res as any).data ?? []);
        setPagination(
          (res as any).pagination ?? {
            page: 1,
            totalPages: 1,
            total: 0,
            limit: 20,
          },
        );
      } finally {
        setIsLoading(false);
      }
    },
    [search, roleFilter],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleStatus = async () => {
    if (!actionUser) return;
    await apiPatch(`/admin/users/${actionUser.id}/status`, {});
    toast.success("User status updated");
    setActionUser(null);
    void load(pagination.page);
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await apiPatch(`/admin/users/${id}/role`, { role: newRole });
    toast.success(`Role changed to ${newRole}`);
    void load(pagination.page);
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${pagination.total} registered users`}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Name or email..."
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none hover:border-zinc-600 transition-colors"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No users found" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-zinc-400">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-200">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-zinc-600">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge
                        color={
                          u.role === "superadmin"
                            ? "orange"
                            : u.role === "admin"
                              ? "blue"
                              : "zinc"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={u.isVerified ? "green" : "zinc"}>
                        {u.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={u.isActive ? "green" : "red"}>
                        {u.isActive ? "Active" : "Banned"}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-xs text-zinc-500">
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-zinc-500">
                        {u.lastLogin ? timeAgo(u.lastLogin) : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {u.role !== "superadmin" && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => void handleToggleRole(u._id, u.role)}
                            title={
                              u.role === "admin" ? "Revoke admin" : "Make admin"
                            }
                          >
                            {u.role === "admin" ? (
                              <ShieldOff className="w-3.5 h-3.5 text-zinc-500" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setActionUser({ id: u._id, name: u.name })
                          }
                          title={u.isActive ? "Ban user" : "Unban user"}
                        >
                          {u.isActive ? (
                            <Ban className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
      <ConfirmDialog
        isOpen={Boolean(actionUser)}
        onClose={() => setActionUser(null)}
        onConfirm={() => void handleToggleStatus()}
        title="Update User Status"
        description={`Toggle account status for ${actionUser?.name}?`}
      />
    </div>
  );
};

// CATEGORIES PAGE
interface CatForm {
  name: string;
  description?: string;
  icon?: string;
  parent?: string;
  sortOrder?: number;
}

const CategoryFormModal = ({
  cat,
  categories,
  onClose,
  onSaved,
}: {
  cat?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CatForm>({
    defaultValues: {
      name: cat?.name ?? "",
      description: cat?.description ?? "",
      icon: cat?.icon ?? "",
      parent: cat?.parent ?? "",
      sortOrder: cat?.sortOrder ?? 0,
    },
  });
  const onSubmit = async (data: CatForm) => {
    try {
      if (cat) {
        await apiPut(`/categories/${cat._id}`, data);
        toast.success("Category updated");
      } else {
        await apiPost("/categories", data);
        toast.success("Category created");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Save failed");
    }
  };
  return (
    <Modal
      isOpen
      title={cat ? "Edit Category" : "New Category"}
      onClose={onClose}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name *"
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />
        <Input label="Description" {...register("description")} />
        <Input label="Icon (emoji)" placeholder="💻" {...register("icon")} />
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Parent Category
          </label>
          <select
            {...register("parent")}
            className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none hover:border-zinc-600 transition-colors"
          >
            <option value="">None (Root)</option>
            {categories
              .filter((c) => !c.parent)
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <Input
          label="Sort Order"
          type="number"
          {...register("sortOrder", { valueAsNumber: true })}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isSubmitting}>
            {cat ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Category Main component
export const CategoriesPage = () => {
  const [cats, setCats] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCat, setEditCat] = useState<Category | null | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<{ data: Category[] }>("/categories");
      setCats((res as any).data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success("Deleted");
      void load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const roots = cats.filter((c) => !c.parent);
  const getChildren = (id: string) => cats.filter((c) => c.parent === id);

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${cats.length} categories`}
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setEditCat(null)}
          >
            New Category
          </Button>
        }
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Sub-categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={5} />
                  ))
                : roots.map((cat) => {
                    const children = getChildren(cat._id);
                    return [
                      <tr key={cat._id} className="bg-zinc-800/10">
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {cat.icon ?? "📁"}
                            </span>
                            <span className="text-xs font-semibold text-zinc-100">
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {cat.slug}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-zinc-400">
                            {children.length}
                          </span>
                        </td>
                        <td>
                          <Badge color={cat.isActive ? "green" : "red"}>
                            {cat.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setEditCat(cat)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setDeleteId(cat._id)}
                              className="text-red-400 hover:bg-red-500/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>,
                      ...children.map((child) => (
                        <tr key={child._id}>
                          <td>
                            <div className="flex items-center gap-2 pl-6">
                              <span className="text-zinc-700 text-xs">└</span>
                              <span className="text-sm">
                                {child.icon ?? "📄"}
                              </span>
                              <span className="text-xs text-zinc-400">
                                {child.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="text-[10px] font-mono text-zinc-600">
                              {child.slug}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-zinc-600">—</span>
                          </td>
                          <td>
                            <Badge color={child.isActive ? "green" : "red"}>
                              {child.isActive ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setEditCat(child)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setDeleteId(child._id)}
                                className="text-red-400 hover:bg-red-500/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )),
                    ];
                  })}
            </tbody>
          </table>
        </div>
      </div>
      {editCat !== undefined && (
        <CategoryFormModal
          cat={editCat}
          categories={cats}
          onClose={() => setEditCat(undefined)}
          onSaved={() => void load()}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        isLoading={isDeleting}
        title="Delete Category"
        description="Products in this category will need to be re-categorized. Remove sub-categories first."
        confirmLabel="Delete"
      />
    </div>
  );
};

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

// SETTINGS PAGE
export const SettingsPage = () => {
  const admin = useAppSelector(selectAdmin);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Account and system configuration"
      />
      <div className="max-w-xl space-y-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-100 mb-4">
            Admin Profile
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-orange-400">
                {admin?.name?.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-zinc-100">{admin?.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{admin?.email}</p>
              <Badge color="orange" className="mt-2 capitalize">
                {admin?.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-100 mb-4">
            System Info
          </p>
          {[
            { k: "Dashboard Version", v: "1.0.0" },
            {
              k: "API Endpoint",
              v: String(import.meta.env.VITE_API_URL ?? "/api/v1"),
            },
            { k: "Environment", v: String(import.meta.env.MODE) },
          ].map(({ k, v }) => (
            <div
              key={k}
              className="flex justify-between py-2.5 border-b border-zinc-800 last:border-0"
            >
              <span className="text-xs text-zinc-500">{k}</span>
              <span className="text-xs font-mono text-zinc-300">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-5 border-red-500/20">
          <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
          <p className="text-xs text-zinc-600 mb-4">
            Signs you out from all devices immediately.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await dispatch(adminLogout());
              navigate("/auth/login");
            }}
          >
            Sign out of all sessions
          </Button>
        </div>
      </div>
    </div>
  );
};
