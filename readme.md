# First setup

## Setup

Get the app :
```bash
cd ~
git clone https://github.com/ndegheselle/Aventurette-web.git
```

Create .env :
```bash
cd /Aventurette-web/front
nano .env
```

## Certificate generation

```bash
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d aventurette.fr \
  -d api.aventurette.fr \
  --email nicolas@degheselle.com \
  --agree-tos \
  --no-eff-email
```

## Pocketbase setup

https://pocketbase.io/docs/going-to-production/#using-reverse-proxy

# Deploy

## Build and start

```bash
docker compose up -d --build 
```

Build without cache :
```bash
docker compose build --no-cache
```

# Debug

Check logs
```bash
docker container ls
docker logs <container-id>
```

Reset everything
```bash
# Stop, remove, delete volumes for all containers
docker stop $(docker ps -a -q)
docker image prune
docker volume prune
```