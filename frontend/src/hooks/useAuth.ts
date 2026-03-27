import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  login,
  logout,
  register,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectIsAdmin,
} from "../features/auth/authSlice";

import { LoginCredentials, RegisterCredentials } from "@/types/typeAuth";

//  useAuth
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAdmin = useAppSelector(selectIsAdmin);

  const signIn = useCallback(
    (credentials: LoginCredentials) => dispatch(login(credentials)),
    [dispatch],
  );

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  const signUp = useCallback(
    (credentials: RegisterCredentials) => dispatch(register(credentials)),
    [dispatch],
  );

  return { user, isAuthenticated, isLoading, isAdmin, signIn, signOut, signUp };
};
