#!/bin/sh
# Renders /etc/nginx/vhosts/*.conf.template into conf.d, substituting the domain from the
# environment. This is how DOMAIN and API_DOMAIN reach the vhosts, so the domain lives in
# the .env file and nowhere else.
#
# The variable list passed to envsubst is not optional: without it envsubst substitutes
# every $name it finds, and nginx's own $host, $uri and $scheme would be replaced with
# empty strings. Adding a variable to a template means adding it here too.
set -eu

: "${DOMAIN:?DOMAIN is not set — see .env.example}"
: "${API_DOMAIN:?API_DOMAIN is not set — see .env.example}"

for template in /etc/nginx/vhosts/*.conf.template; do
    output="/etc/nginx/conf.d/$(basename "$template" .template)"
    envsubst '${DOMAIN} ${API_DOMAIN}' < "$template" > "$output"
    echo "$0: rendered $output"
done
