#!/bin/sh
# Issues the Let's Encrypt certificate, covering DOMAIN, APP_DOMAIN, ADMIN_DOMAIN and API_DOMAIN.
#
# Run once, from backend/, with the stack already up — nginx has to be answering
# on port 80 for the webroot challenge to succeed:
#
#   docker compose up -d --build
#   sh scripts/init-certificate.sh
#   docker compose restart nginx
#
# Renewals are handled by the certbot service and need no further action. Safe to re-run:
# certbot leaves an existing, valid certificate alone unless asked otherwise. When a hostname
# is added to .env, re-running it extends the existing certificate (--expand) under the same name,
# so the path nginx reads does not change.
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
    echo "error: no .env in $(pwd) — copy .env.example to .env and set your domain first." >&2
    exit 1
fi

# Read the same file compose reads, so the domain is never typed twice.
. ./.env

for var in DOMAIN APP_DOMAIN ADMIN_DOMAIN API_DOMAIN CERTBOT_EMAIL; do
    eval "value=\${$var:-}"
    if [ -z "$value" ]; then
        echo "error: $var is not set in .env" >&2
        exit 1
    fi
done

echo "Requesting a certificate for $DOMAIN, $APP_DOMAIN, $ADMIN_DOMAIN and $API_DOMAIN..."

# --entrypoint is needed because the service's own entrypoint is the renewal loop.
docker compose run --rm --entrypoint certbot certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --cert-name "$DOMAIN" \
    --expand \
    -d "$DOMAIN" \
    -d "$APP_DOMAIN" \
    -d "$ADMIN_DOMAIN" \
    -d "$API_DOMAIN" \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email

echo
echo "Done. Enable HTTPS with: docker compose restart nginx"
