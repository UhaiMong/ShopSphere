import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import "./styles/globals.css";
import { AppBootstrap } from "./routes/AppBootstrap";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <AppBootstrap />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "Geist, sans-serif",
            fontSize: "13px",
            borderRadius: "10px",
            background: "#18181b",
            border: "1px solid #27272a",
            color: "#fafafa",
          },
          success: { iconTheme: { primary: "#f97316", secondary: "#18181b" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#18181b" } },
          duration: 3000,
        }}
      />
    </Provider>
  </StrictMode>,
);
