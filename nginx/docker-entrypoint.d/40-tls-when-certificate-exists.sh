#!/bin/sh
# Breaks the certificate deadlock on a fresh server.
#
# nginx will not start if ssl_certificate points at a file that does not exist, and
# Let's Encrypt only issues that file once nginx is already answering the ACME challenge
# on port 80. So the HTTPS vhosts are held back until a certificate is on disk: start the
# stack (HTTP only), issue the certificate, restart this container.
#
# 20-render-vhosts.sh re-renders the vhosts on every start, so this only ever has to
# remove — which also means it recovers on its own if the certbot volume is wiped.
set -eu

conf="/etc/nginx/conf.d/10-tls.conf"

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "$0: certificate found for $DOMAIN — HTTPS enabled"
else
    rm -f "$conf"
    echo "$0: no certificate for $DOMAIN yet — serving HTTP only."
    echo "$0: issue one with scripts/init-certificate.sh, then: docker compose restart nginx"
fi
