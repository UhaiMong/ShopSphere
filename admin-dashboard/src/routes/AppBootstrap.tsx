import { lazy, Suspense, useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import {
  useAppSelector,
  useAppDispatch,
  selectIsAuthenticated,
  selectAuthLoading,
  adminGetMe,
} from "../app/store";
import { router } from "./AppRouter";

// Bootstrap: verify token on mount
export const AppBootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) void dispatch(adminGetMe());
    else dispatch({ type: "auth/getMe/rejected" });

    window.addEventListener("admin:logout", () => {
      window.location.href = "/auth/login";
    });
  }, [dispatch]);

  return <RouterProvider router={router} />;
};
