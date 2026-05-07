import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  withCredentials: true,
  timeout: 20_000,
});

// Inject access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("admin_token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh + force logout
let refreshing = false;
api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const orig = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      err.response?.status !== 401 ||
      orig._retry ||
      orig.url?.includes("/auth/")
    ) {
      return Promise.reject(err);
    }
    if (refreshing) return Promise.reject(err);
    refreshing = true;
    orig._retry = true;
    try {
      const { data } = await api.post<{ data: { accessToken: string } }>(
        "/auth/refresh",
      );
      localStorage.setItem("admin_token", data.data.accessToken);
      orig.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(orig);
    } catch {
      localStorage.removeItem("admin_token");
      window.dispatchEvent(new CustomEvent("admin:logout"));
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  },
);

// Typed helpers
export const apiGet = <T>(url: string, params?: object) =>
  api.get<T>(url, { params }).then((r) => r.data);
export const apiPost = <T>(url: string, data?: unknown) =>
  api.post<T>(url, data).then((r) => r.data);
export const apiPut = <T>(url: string, data?: unknown) =>
  api.put<T>(url, data).then((r) => r.data);
export const apiPatch = <T>(url: string, data?: unknown) =>
  api.patch<T>(url, data).then((r) => r.data);
export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);

export default api;
