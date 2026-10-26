#!/bin/sh
# Deploys the head of the `production` branch: checkout, build, back up, restart.
#
# Run by the deploy workflow (.github/workflows/deploy.yml) over SSH, or by hand on the server:
#
#   sh ~/Aventurette-web/backend/scripts/deploy.sh
#
# Images are built while the current version is still serving, so the only downtime is the
# backup and the restart. If any step fails the script stops and the running version stays up.
set -eu

# Everything is inside a function so the shell has read the whole file before the checkout
# below replaces it with the new version.
main() {
    cd "$(dirname "$0")/.."

    echo "==> Checking out origin/production"
    git fetch origin production
    git checkout -f -B production origin/production
    git log -1 --format='    %h %s'

    echo "==> Building images"
    docker compose build

    echo "==> Backing up pb_data"
    sh scripts/backup.sh

    # Recreates only the containers whose image changed. Migrations run as the api starts.
    echo "==> Starting the new version"
    docker compose up -d

    # Each build leaves the previous images dangling.
    docker image prune -f

    docker compose ps
}

main "$@"
exit
