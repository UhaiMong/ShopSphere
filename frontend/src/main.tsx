import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import { getMe } from "./features/auth/authSlice";
import { clearCartState } from "./features/cart/cartSlice";
import { AppRouter } from "./routes/AppRouter";
import "./global.css";

const AppBootstrap = () => {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      void store.dispatch(getMe());
    } else {
      // Mark auth as done so ProtectedRoute doesn't hang on spinner
      store.dispatch({ type: "auth/getMe/rejected" });
    }

    // Listen for forced logout from the Axios interceptor (refresh failed)
    const handleForceLogout = () => {
      store.dispatch(clearCartState());
      window.location.href = "/auth/login";
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  return <AppRouter />;
};

// Mount
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <AppBootstrap />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            border: "1px solid #e7e5e0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            color: "#1c1917",
            background: "#ffffff",
          },
          success: { iconTheme: { primary: "#f25212", secondary: "#fff" } },
        }}
      />
    </Provider>
  </StrictMode>,
);
