import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    target: "es6",
    minify: "esbuild",
  },
  plugins: [react()],
});
