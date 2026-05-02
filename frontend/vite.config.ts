import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Development
    server: isDev
      ? {
          port: 3000,
          proxy: {
            "/api": {
              target: "http://localhost:5000",
              changeOrigin: true,
            },
          },
        }
      : {},

    // Production
    build: !isDev
      ? {
          rollupOptions: {
            output: {
              manualChunks: {
                vendor: ["react", "react-dom", "react-router-dom"],
                redux: ["@reduxjs/toolkit"],
                ui: ["lucide-react"],
              } as any,
            },
          },
        }
      : {},
  };
});
