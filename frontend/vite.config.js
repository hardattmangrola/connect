import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from frontend folder only
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:8010";

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/socket.io": {
          target: backendUrl,
          ws: true,
        },
      },
    },
  };
});
