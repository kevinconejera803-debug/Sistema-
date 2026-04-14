import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  base: "/static/landing/",
  build: {
    outDir: "../backend/app/static/landing",
    emptyOutDir: true,
    chunkSizeWarningLimit: 700
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    testTimeout: 20000,
    hookTimeout: 20000
  }
});
