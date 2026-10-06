import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const proxy = { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  envDir: fileURLToPath(new URL("../", import.meta.url)),
  server: { port: 5173, proxy },
  preview: { proxy },
});
