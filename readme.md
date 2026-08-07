# Aventurette

An npm workspace: the `front/` app on top of three `packages/`. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the layout and the boundaries between them.

# First setup

## Setup

Get the app. The `chapelure` library used to be a git submodule and is now a workspace
package, so no `--recurse-submodules` is needed:

```bash
cd ~
git clone https://github.com/ndegheselle/Aventurette-web.git
```

Install once from the repository root — the workspace owns the lockfile, so do not run
`npm install` inside `front/`:

```bash
cd Aventurette-web
npm install
```

Create .env :
```bash
cd front
cp .env.example .env
nano .env
```

## Develop

```bash
npm run dev         # dev server
npm run build       # typecheck (app + packages) and build
npm run lint:arch   # architecture boundaries
npm run check       # both of the above
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

The front image builds from the **repository root**, not `front/`, because the app depends on
`packages/`:

```bash
docker build -f front/Dockerfile -t aventurette-front .
```

> Note: `compose.yml` builds `nginx/Dockerfile`, which does not exist, and declares no `front`
> service — so the SPA is not currently deployed by the compose stack. That predates the
> workspace change and is still open.

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