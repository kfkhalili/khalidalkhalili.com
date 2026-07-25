import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    // Only this tree's tests. The default exclude covers node_modules but not
    // the git worktrees the agent harness checks out under .claude/, whose
    // tests would otherwise run here and resolve `@` against the main tree.
    exclude: [
      "**/node_modules/**",
      "**/.claude/**",
      "**/.next/**",
      "**/coverage/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["app/**", "components/**", "lib/**", "proxy.ts"],
      // Everything is covered; the branch gap is two unreachable fallbacks
      // (an empty path join, and the equal-date arm of the project sort).
      thresholds: {
        statements: 100,
        branches: 99,
        functions: 100,
        lines: 100,
      },
    },
  },
});
