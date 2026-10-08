# Build from the repository root: docker build -t biborto .
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml web/.npmrc ./
RUN npm install --global pnpm@12.3.4 \
    && pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY web/ ./
RUN mkdir -p public

RUN npm run build

# Runtime-only packages for scripts/init-db.mjs. Next's standalone bundle inlines the app's own
# copies of these, so they are not importable as modules in the final image.
FROM node:22-alpine AS init-tools
WORKDIR /tools
COPY web/.npmrc ./
RUN npm install --no-save --no-audit --no-fund postgres@3.4.9 bcryptjs@3.0.3

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# One-time database setup (server/init-db.sh): the script, the SQL it applies, and its two packages.
COPY --chown=nextjs:nodejs web/scripts/init-db.mjs ./scripts/init-db.mjs
COPY --chown=nextjs:nodejs db/schema.sql db/seed_disciplines.sql db/seed_countries.sql db/seed_members.sql db/seed_superadmin.sql db/seed_site_settings.sql ./db/
COPY --from=init-tools --chown=nextjs:nodejs /tools/node_modules/ ./node_modules/

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
