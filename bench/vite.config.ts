import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: { reportCompressedSize: true, rollupOptions: { input: { main: "index.html", compare: "compare.html", shell: "shell.html" } } },
});
