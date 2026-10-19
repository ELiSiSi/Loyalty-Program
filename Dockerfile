# ═══════════════════════════════════════════════════════════════════════
# Stage 1: Build stage
# ═══════════════════════════════════════════════════════════════════════
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and build TypeScript to dist
COPY src/ ./src/
RUN npm run build

# Prune devDependencies to keep only production packages
RUN npm prune --production

# ═══════════════════════════════════════════════════════════════════════
# Stage 2: Minimal Production Runtime
# ═══════════════════════════════════════════════════════════════════════
FROM node:22-alpine AS runner

WORKDIR /app

# Security: Set NODE_ENV to production and create non-root user
ENV NODE_ENV=production
ENV PORT=3000

# Install curl for Docker healthchecks
RUN apk add --no-cache curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy compiled JavaScript output and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
