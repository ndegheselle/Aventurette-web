# The clients' app, built for the web and served by its own nginx. The build context is
# frontend/mobile/ (see backend/compose.yml): unlike the admin app, it depends on nothing outside
# its own folder.
#
#   docker build --build-arg API_URL=https://api.lubriciel.ovh -t aventurette-app frontend/mobile

# -----------------------
# 1. Build stage
# -----------------------
FROM debian:bookworm-slim AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git unzip xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Pinned, so a deploy builds with the same Flutter as CI (.github/workflows/check.yml). There is
# no official image, and the community ones lag behind the version pubspec.lock needs.
ARG FLUTTER_VERSION=3.50.1
RUN git clone --depth 1 --branch "$FLUTTER_VERSION" https://github.com/flutter/flutter.git /opt/flutter
ENV PATH="/opt/flutter/bin:$PATH"
# Fetches the Dart SDK and the web engine once, in a layer of its own.
RUN flutter config --no-analytics --enable-web && flutter precache --web

WORKDIR /app

# Manifests first, so the dependency layer is cached independently of source changes.
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

# The slang translations (lib/ui/i18n/*.g.dart) are committed, so no generation step.
COPY . .

# Read by lib/backend/pocketbase/client.dart through String.fromEnvironment, so it is compiled
# into the bundle: changing it needs a rebuild, not a restart.
ARG API_URL
RUN test -n "$API_URL" || (echo "API_URL build arg is required" >&2; exit 1)
RUN flutter build web --release --dart-define=API_URL="$API_URL"


# -----------------------
# 2. Production stage
# -----------------------
FROM nginx:alpine

# Reached only through the edge nginx on the internal compose network, so no TLS and no
# port published to the host.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build/web /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
