# PocketBase, compiled from back/. The build context is back/ (see compose.yml), so every
# path below is relative to that folder.
#
#   docker build -t lubriciel-api ./back

# -----------------------
# 1. Build stage
# -----------------------
FROM golang:1.25-alpine AS builder

WORKDIR /src

# Manifests first, so the module cache layer survives source changes.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# The SQLite driver (modernc.org/sqlite) is pure Go, so the binary can be static.
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/pocketbase .


# -----------------------
# 2. Production stage
# -----------------------
FROM alpine:latest

# ca-certificates for outgoing TLS (mailer, OAuth providers), tzdata for cron schedules.
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /out/pocketbase ./pocketbase

# pb_data is bind-mounted from the host — it holds the database, uploaded files and settings.
VOLUME /app/pb_data

EXPOSE 8090

# Registered migrations under back/migrations are applied on start. Automigrate is off in a
# compiled binary (see main.go), which is what we want in production: schema changes are
# committed as migration files, never written by the running server.
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
