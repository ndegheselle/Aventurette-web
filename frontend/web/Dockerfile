# The build context is the REPOSITORY ROOT, not frontend/web/, because the app depends on the
# workspace packages under frontend/packages/ which live outside frontend/web/, and on the alias
# map in backend/scripts/. The image mirrors that layout under /repo.
#
#   docker build -f frontend/web/Dockerfile --build-arg VITE_API_URL=https://api.lubriciel.ovh -t aventurette-front .

# -----------------------
# 1. Build stage
# -----------------------
FROM node:alpine AS builder

WORKDIR /repo/frontend

# Vite inlines VITE_* variables into the bundle at build time, so the API URL is baked
# into the image: changing it needs a rebuild, not a restart. Set as an ENV rather than
# written to frontend/web/.env because Vite gives real environment variables priority over the
# .env file, and frontend/web/.env is kept out of the build context (see
# Dockerfile.dockerignore).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Manifests first, so the dependency layer is cached independently of source changes.
# Every workspace member's package.json is needed for `npm ci` to resolve the workspace.
COPY frontend/package.json frontend/package-lock.json ./
COPY frontend/packages/core/package.json packages/core/
COPY frontend/packages/pocketbase/package.json packages/pocketbase/
COPY frontend/packages/ui/package.json packages/ui/
COPY frontend/web/package.json web/
RUN npm ci

# Source. vite.config.ts reads its aliases from backend/scripts/aliases.mjs, which resolves
# them against ../../frontend, hence the mirrored layout.
COPY backend/scripts/aliases.mjs /repo/backend/scripts/
COPY frontend/packages/ packages/
COPY frontend/web/ web/

# Bundle only: the typecheck (which covers the specs, hence needs tests/) is CI's job, see
# .github/workflows/check.yml.
RUN npm exec --workspace @aventurette/front -- vite build


# -----------------------
# 2. Production stage
# -----------------------
FROM nginx:alpine

# Reached only through the edge nginx on the internal compose network, so no TLS and no
# port published to the host.

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /repo/frontend/web/dist /usr/share/nginx/html

# SPA routing: unknown paths must fall back to index.html or deep links 404.
COPY frontend/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
