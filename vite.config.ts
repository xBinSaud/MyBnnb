import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: [".js", ".cjs"],
    },
  },
});
