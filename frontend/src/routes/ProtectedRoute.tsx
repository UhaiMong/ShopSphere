import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  selectAuthLoading,
} from "../features/auth/authSlice";
import { Spinner } from "../components/ui";

export const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  // Still verifying token on mount — show spinner, don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
