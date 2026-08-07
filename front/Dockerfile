# The build context is the REPOSITORY ROOT, not front/, because the app depends on the
# workspace packages under packages/ which live outside front/.
#
#   docker build -f front/Dockerfile -t aventurette-front .

# -----------------------
# 1. Build stage
# -----------------------
FROM node:alpine AS builder

WORKDIR /repo

# Manifests first, so the dependency layer is cached independently of source changes.
# Every workspace member's package.json is needed for `npm ci` to resolve the workspace.
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/pocketbase/package.json packages/pocketbase/
COPY packages/ui/package.json packages/ui/
COPY front/package.json front/
RUN npm ci

# Source
COPY packages/ packages/
COPY front/ front/

RUN npm run build --workspace @sagace/front


# -----------------------
# 2. Production stage
# -----------------------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /repo/front/dist /usr/share/nginx/html

# SPA routing: unknown paths must fall back to index.html or deep links 404.
COPY front/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
