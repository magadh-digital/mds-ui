import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// The docs use the package as built in ../dist (exactly what npm ships), with one copy of React.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@mds\/ui\/styles\.css$/, replacement: resolve(__dirname, "../dist/styles.css") },
      { find: /^@mds\/ui\/reset\.css$/, replacement: resolve(__dirname, "../dist/reset.css") },
      { find: /^@mds\/ui$/, replacement: resolve(__dirname, "../dist/index.js") },
    ],
    dedupe: ["react", "react-dom"],
  },
  build: { outDir: "dist", chunkSizeWarningLimit: 1500 },
});
