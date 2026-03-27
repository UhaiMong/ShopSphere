import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Ban,
  CheckCircle2,
  Users as UsersIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiGet, apiPatch } from "@/services/api";
import { formatDate, timeAgo } from "@/utils";
import { PaginatedResponse, User } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState, SkeletonRow } from "@/components/ui/SkeletonRow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
