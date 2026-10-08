import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests: pure logic only — no server, no database. `npm test`.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // lib/db/client.ts builds a (lazy, never-connecting) postgres client at import time.
    env: { DATABASE_URL: "postgres://unit:unit@127.0.0.1:1/unit", AUTH_SECRET: "unit-test-secret" },
  },
});
