import {
  selectAuthLoading,
  selectIsAuthenticated,
  useAppSelector,
} from "@/app/store";
import { Spinner } from "@/components/ui/Spinner";
import { AdminLayout } from "@/layout/AdminLayout";
import { Navigate } from "react-router-dom";

// Protected route
export const ProtectedRoute = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!isAuth) return <Navigate to="/auth/login" replace />;
  return <AdminLayout />;
};
