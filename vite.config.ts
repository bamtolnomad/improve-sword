import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/improve-sword/",
  plugins: [react()],
  server: {
    allowedHosts: ["mac-mini.tail4ed612.ts.net"],
  },
});
