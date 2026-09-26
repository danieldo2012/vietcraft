# Multi-stage Dockerfile for @friendlylotus/api
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations and package definitions
COPY package*.json tsconfig.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/
COPY apps/api/package*.json ./apps/api/

RUN npm install

# Copy source codes
COPY packages ./packages
COPY apps/api ./apps/api

# Build shared packages and API
RUN npm run build --workspace=@friendlylotus/api

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/
COPY apps/api/package*.json ./apps/api/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 5000

CMD ["node", "apps/api/dist/server.js"]
