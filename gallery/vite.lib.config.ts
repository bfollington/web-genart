import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/sketches/index.tsx"),
      name: "sketches",
      fileName: (format) => `sketches.${format}.js`,
    },
  },
});
