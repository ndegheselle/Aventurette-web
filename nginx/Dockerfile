# The edge: TLS termination, the ACME challenge, and routing by hostname to the front and
# api containers. The build context is the REPOSITORY ROOT (see compose.yml).
#
#   docker build -f nginx/Dockerfile -t lubriciel-nginx .
FROM nginx:alpine

# The image ships a catch-all vhost on port 80 that would shadow ours.
RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Deliberately NOT /etc/nginx/templates: that is the base image's own envsubst directory,
# and its script substitutes every variable defined in the environment. The two scripts
# below render these instead, with an explicit variable list.
COPY nginx/templates/ /etc/nginx/vhosts/

# The base image's entrypoint runs everything in here, in name order, before starting nginx.
COPY nginx/docker-entrypoint.d/ /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/*.sh

EXPOSE 80 443
