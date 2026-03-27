import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  selectAuthLoading,
} from "../features/auth/authSlice";
import { PageLoader } from "@/components/ui/PageLoader";

export const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  // Still verifying token on mount
  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // After login preserved redirecting
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
