import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      reporter: ["text", "json-summary", "json"],
      extension: [".js"],
      all: true,
      include: ["applications/**/*.js"],
      exclude: ["src/**/*.test.ts"],
    },
    snapshotFormat: {
      escapeString: false,
    },
  },
})
