import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../../types";
import api from "@/services/app";

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: false,
  isLoading: true, // true on mount while we verify token
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{
        data: { user: User; accessToken: string };
      }>("/auth/login", credentials);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", credentials);
      return data.message as string;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message ?? "Registration failed",
      );
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
  }
});

export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: User }>("/auth/me");
      return data.data;
    } catch {
      localStorage.removeItem("accessToken");
      return rejectWithValue("Session expired");
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload.accessToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (builder) => {
    // ── login ──────────────────────────────────────────────────────────────
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
      });

    // ── logout ─────────────────────────────────────────────────────────────
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });

    // ── getMe ──────────────────────────────────────────────────────────────
    builder
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.accessToken = null;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role === "admin" || state.auth.user?.role === "superadmin";
