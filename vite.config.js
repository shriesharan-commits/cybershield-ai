import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request to /api/* gets forwarded to the Express backend on port 5000
      // This means the browser never needs to know about port 5000
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
