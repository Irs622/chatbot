# Multi-stage production Dockerfile for Inpartner AI Assistant & CRM
# Base on Node 20 LTS Alpine for minimal image size and attack surface

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Step 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Step 2: Build application assets
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Step 3: Production runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/knowledge ./knowledge
COPY --from=builder /app/data ./data

# Set proper ownership for data directory (fallback JSON cache)
RUN chown -R nextjs:nodejs /app/data

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
