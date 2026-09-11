import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [
      ".agents/**",
      "AGENTS.md",
      "docs/agents/**",
      "skills-lock.json",
      ".astro/**",
      "dist/**",
      "test-results/**",
      "playwright-report/**",
      "pnpm-lock.yaml",
    ],
  },
  lint: {
    ignorePatterns: [
      ".agents/**",
      ".astro/**",
      "dist/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
});
