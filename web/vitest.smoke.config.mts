import { defineConfig } from "vitest/config";

// HTTP smoke tests against a running server seeded from db/seed*.sql:
//   npm run dev   (or next start)   then   npm run test:smoke
// SMOKE_BASE_URL defaults to http://localhost:3000.
export default defineConfig({
  test: { include: ["tests/smoke/**/*.test.ts"], environment: "node", testTimeout: 30_000 },
});
