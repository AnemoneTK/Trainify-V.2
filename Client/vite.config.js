import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
