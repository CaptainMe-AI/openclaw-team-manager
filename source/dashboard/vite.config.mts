import { defineConfig } from "vite";
import ViteRails from "vite-plugin-rails";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/frontend"),
    },
  },
  plugins: [
    ViteRails(),
    tailwindcss(),
  ],
});
