import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/geoportal-inundaciones-milagro/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        heatmap: resolve(__dirname, "heatmap.html")
      }
    }
  }
});