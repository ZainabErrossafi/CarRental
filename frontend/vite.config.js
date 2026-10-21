import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const proxy = Object.fromEntries(["/api", "/media"].map((path) => [path, { target: "http://127.0.0.1:8000", changeOrigin: true }]));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: fileURLToPath(new URL("../", import.meta.url)),
  server: { port: 5173, proxy },
  preview: { proxy },
});
