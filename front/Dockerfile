# The build context is the REPOSITORY ROOT, not front/, because the app depends on the
# workspace packages under packages/ which live outside front/.
#
#   docker build -f front/Dockerfile --build-arg VITE_API_URL=https://api.lubriciel.ovh -t lubriciel-front .

# -----------------------
# 1. Build stage
# -----------------------
FROM node:alpine AS builder

WORKDIR /repo

# Vite inlines VITE_* variables into the bundle at build time, so the API URL is baked
# into the image: changing it needs a rebuild, not a restart. Set as an ENV rather than
# written to front/.env because Vite gives real environment variables priority over the
# .env file, and front/.env is kept out of the build context (see .dockerignore).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

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

# Reached only through the edge nginx on the internal compose network, so no TLS and no
# port published to the host.

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /repo/front/dist /usr/share/nginx/html

# SPA routing: unknown paths must fall back to index.html or deep links 404.
COPY front/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
