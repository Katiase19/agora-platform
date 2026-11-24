import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Where the Spring Boot backend runs during `npm run dev`.
  // Requests to /api and /uploads are proxied there, so no CORS setup is needed locally.
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:8080";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": { target: backendUrl, changeOrigin: true },
        "/uploads": { target: backendUrl, changeOrigin: true },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      pool: "vmThreads",
    },
  };
});
