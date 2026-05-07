import {
  adminLogout,
  selectAdmin,
  useAppDispatch,
  useAppSelector,
} from "@/app/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useNavigate } from "react-router";

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
