import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In Docker Compose the backend service is reachable as "backend".
// Locally (npm run dev outside compose), override with VITE_API_PROXY_TARGET.
const apiTarget = process.env.VITE_API_PROXY_TARGET || "http://backend:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/tasks": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
