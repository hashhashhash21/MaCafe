import { defineConfig } from "vite";
import vinext from "vinext/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vinext(), cloudflare()],
});
