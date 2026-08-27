#!/bin/sh
# Picks up renewed certificates.
#
# certbot writes a renewed certificate into the shared volume, but nginx only reads it on
# reload and the certbot container has no way to signal this one. So reload on a timer —
# a no-op when nothing changed, and it means a renewal needs no manual step.
#
# This has to be an entrypoint script rather than a compose `command:` override: the base
# image's entrypoint only runs /docker-entrypoint.d/* when the command starts with `nginx`,
# so overriding the command would skip the vhost render and the TLS gate as well.
set -eu

# 12h, in seconds: busybox sleep suffixes are not guaranteed.
(
    while :; do
        sleep 43200
        nginx -s reload 2>&1 || true
    done
) &

echo "$0: certificate reload loop started (every 12h)"
