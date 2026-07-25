import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // Only this tree's tests. The default exclude covers node_modules but not
    // the git worktrees the agent harness checks out under .claude/, whose
    // tests would otherwise run here and resolve `@` against the main tree.
    include: ["{app,lib,components}/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.claude/**", "**/.next/**"],
  },
  resolve: {
    // Mirror the tsconfig `@/*` path alias so any module is testable, not just
    // the ones that happen to import nothing.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
