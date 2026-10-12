import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __OTT_SESSION_ID__: JSON.stringify("ott-local-session"),
  },

  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4174",
        changeOrigin: true,
      },
    },
  },
});
