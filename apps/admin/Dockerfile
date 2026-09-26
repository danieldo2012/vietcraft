# Multi-stage Dockerfile for @friendlylotus/admin
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/
COPY apps/admin/package*.json ./apps/admin/

RUN npm install

COPY packages ./packages
COPY apps/admin ./apps/admin

RUN npm run build --workspace=@friendlylotus/admin

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

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
