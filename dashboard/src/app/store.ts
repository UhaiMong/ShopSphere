import {
  configureStore,
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import api from "@/services/api";
import { AdminUser } from "@/types";

// Auth Slice
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem("admin_token"),
  isAuthenticated: false,
  isLoading: !!localStorage.getItem("admin_token"),
};

export const adminLogin = createAsyncThunk(
  "auth/login",
  async (creds: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{
        data: { user: AdminUser; accessToken: string };
      }>("/auth/login", creds);
      const { user, accessToken } = data.data;
      if (!["admin", "superadmin"].includes(user.role)) {
        return rejectWithValue("Access denied. Admin privileges required.");
      }
      return { user, accessToken };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Login failed");
    }
  },
);

export const adminGetMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: AdminUser }>("/auth/me");
      if (!["admin", "superadmin"].includes(data.data.role)) {
        return rejectWithValue("Access denied");
      }
      return data.data;
    } catch {
      return rejectWithValue("Session expired");
    }
  },
);

export const adminLogout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("admin_token");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("admin_token", action.payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(adminLogin.fulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem("admin_token", payload.accessToken);
    });
    b.addCase(adminLogin.rejected, (state) => {
      state.isLoading = false;
    });
    b.addCase(adminGetMe.pending, (state) => {
      state.isLoading = true;
    });
    b.addCase(adminGetMe.fulfilled, (state, { payload }) => {
      state.user = payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    b.addCase(adminGetMe.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.token = null;
      localStorage.removeItem("admin_token");
    });
    b.addCase(adminLogout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
  },
});

export const { clearAuth, setToken } = authSlice.actions;

// Store
export const store = configureStore({
  reducer: { auth: authSlice.reducer },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(sel: (s: RootState) => T) => useSelector(sel);

// Selectors
export const selectAdmin = (s: RootState) => s.auth.user;
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectAuthLoading = (s: RootState) => s.auth.isLoading;
export const selectIsSuperAdmin = (s: RootState) =>
  s.auth.user?.role === "superadmin";
