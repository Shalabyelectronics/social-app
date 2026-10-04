import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
      css: false,
      // HeroUI is heavy to load the first time; give slow machines room
      testTimeout: 20000,
    },
  }),
);
