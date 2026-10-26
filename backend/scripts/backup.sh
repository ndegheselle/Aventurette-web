#!/bin/sh
# Archives api/pb_data into backups/pb_data-<date>.tar.gz and keeps the newest $KEEP (10).
#
# Run from anywhere on the server; scripts/deploy.sh runs it before every deploy:
#
#   sh scripts/backup.sh
#
# The api container is stopped while the archive is written, so SQLite has no write in
# flight and the copy is consistent — a few seconds of API downtime. It is started again
# whatever happens, even if the archive fails.
#
# Restore one (see DEPLOYMENT.md, "Restore a backup"):
#
#   docker compose stop api
#   docker compose run --rm --no-deps -v "$PWD/backups:/backups" --entrypoint sh api -c \
#       'find /app/pb_data -mindepth 1 -maxdepth 1 ! -name backups -exec rm -rf {} + &&
#        tar xzf /backups/<file> -C /app'
#   docker compose start api
set -eu

cd "$(dirname "$0")/.."

KEEP="${KEEP:-10}"
name="pb_data-$(date +%Y%m%d-%H%M%S).tar.gz"

# Created by this user, not by Docker as root, so old archives can be pruned without sudo.
mkdir -p backups

echo "Stopping api to back up pb_data..."
docker compose stop api
trap 'docker compose start api' EXIT

# pb_data is written by the container as root, so it is read from inside the api image rather
# than from the host. PocketBase's own backups/ is left out: it is already a copy.
docker compose run --rm --no-deps \
    -v "$(pwd)/backups:/backups" \
    --entrypoint tar \
    api czf "/backups/$name" --exclude pb_data/backups -C /app pb_data

echo "Wrote backups/$name ($(du -h "backups/$name" | cut -f1))."

# Newest first; everything after the first $KEEP goes.
ls -1t backups/pb_data-*.tar.gz | tail -n +"$((KEEP + 1))" | while read -r old; do
    echo "Removing $old"
    rm -f "$old"
done
