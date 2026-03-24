# ══════════════════════════════════════════════════════════════════
# Stage 1 — Builder
# Install all deps and compile TypeScript to JavaScript
# ══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (Docker layer cache)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune dev dependencies — only production deps go to final stage
RUN npm ci --omit=dev --ignore-scripts

# ══════════════════════════════════════════════════════════════════
# Stage 2 — Runner (production image)
# ══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S shopsphere -u 1001 -G nodejs

WORKDIR /app

# Copy compiled output and production node_modules from builder
COPY --from=builder --chown=shopsphere:nodejs /app/dist ./dist
COPY --from=builder --chown=shopsphere:nodejs /app/node_modules ./node_modules
COPY --chown=shopsphere:nodejs package.json ./

USER shopsphere

EXPOSE 5000

# Health check — used by Docker Compose and Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
