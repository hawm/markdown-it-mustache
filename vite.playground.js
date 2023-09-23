import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "playground",
  build: {
    outDir: "../dist/playground",
  },
});
