import { defineConfig } from "vitest/config";
import path from "node:path";
import fs from "node:fs";

// Tests that need a real Postgres (the dev database from .env.local): `npm run test:integration`.
// They only touch rows with a unique throwaway key and clean up after themselves.
if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    testTimeout: 20_000,
  },
});
