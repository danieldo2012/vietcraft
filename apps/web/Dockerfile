# Multi-stage Dockerfile for @friendlylotus/web
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY packages ./packages
COPY apps/web ./apps/web

RUN npm run build --workspace=@friendlylotus/web

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# SPA fallback configuration
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
