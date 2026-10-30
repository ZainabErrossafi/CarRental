import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const envDir = fileURLToPath(new URL("../", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, envDir, ""), ...process.env };
  const proxy = env.DEV_PROXY_TARGET
    ? Object.fromEntries(["/api", "/media"].map((path) => [path, { target: env.DEV_PROXY_TARGET, changeOrigin: true }]))
    : undefined;

  return {
    plugins: [react(), tailwindcss()],
    envDir,
    server: { ...(env.DEV_PORT ? { port: Number(env.DEV_PORT) } : {}), proxy },
    preview: { proxy },
  };
});
