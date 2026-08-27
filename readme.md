# Aventurette

An npm workspace: the `front/` app on top of three `packages/`, and a PocketBase backend in
`back/`. See [ARCHITECTURE.md](ARCHITECTURE.md) for the layout and the boundaries between
them, and [DEPLOYMENT.md](DEPLOYMENT.md) to put it on a server.

Live at [lubriciel.ovh](https://lubriciel.ovh), with the API on
[api.lubriciel.ovh](https://api.lubriciel.ovh).

# First setup

## Setup

Get the app. The `chapelure` library used to be a git submodule and is now a workspace
package, so no `--recurse-submodules` is needed:

```bash
git clone https://github.com/ndegheselle/Aventurette-web.git
```

Install once from the repository root — the workspace owns the lockfile, so do not run
`npm install` inside `front/`:

```bash
cd Aventurette-web && npm install
```

Create the dev server's env file. This one points at a local PocketBase; the deployed domain
lives in the root `.env` instead (see below):

```bash
cp front/.env.example front/.env
```

## Develop

```bash
npm run dev         # dev server
npm run build       # typecheck (app + packages) and build
npm run lint:arch   # architecture boundaries
npm run check       # both of the above
```

The API runs separately, from `back/` — see [back/readme.md](back/readme.md).

# Deploy

**Setting up a new server: follow [DEPLOYMENT.md](DEPLOYMENT.md).** It goes from a bare VPS
to a working HTTPS site. What follows is the summary and the day-to-day commands.

## The stack

`compose.yml` runs four containers on one internal network. Only `nginx` publishes ports, so
neither the SPA nor PocketBase is reachable from the internet except through it:

| Service | Built from | Role |
|---|---|---|
| `nginx` | `nginx/Dockerfile` | TLS termination, ACME challenge, routing by hostname |
| `front` | `front/Dockerfile` | the built SPA, on the internal network only |
| `api` | `back/Dockerfile` | PocketBase, compiled from `back/` |
| `certbot` | `certbot/certbot` | certificate renewal, every 12h |

## Configuration

One file, the root `.env`, holds everything site-specific:

```bash
cp .env.example .env
```

```
DOMAIN=lubriciel.ovh
API_DOMAIN=api.lubriciel.ovh
CERTBOT_EMAIL=nicolas@degheselle.com
```

The domain is written nowhere else. `DOMAIN` and `API_DOMAIN` are substituted into
`nginx/templates/*.template` when the nginx container starts, used by
`scripts/init-certificate.sh` to request the certificate, and combined into the
`VITE_API_URL` that Vite inlines into the front bundle.

Because Vite inlines it at *build* time, changing the domain needs a rebuild of the front
image, not just a restart:

```bash
docker compose up -d --build front
```

> `front/.env` is a different file, for the local dev server only. It is kept out of the
> Docker build context so a localhost value can never end up in a production bundle.

## Deploy an update

```bash
git pull && docker compose up -d --build
```

Only changed images are rebuilt. The two things that hold state — `back/pb_data` and
`nginx/certbot` — are host directories, so no rebuild can lose them.

## HTTPS

The first certificate is issued once, with the stack already running:

```bash
./scripts/init-certificate.sh && docker compose restart nginx
```

One certificate covers both hostnames. Renewal is automatic from then on: the `certbot`
container renews every 12h and the nginx container reloads on the same cadence.

nginx will not start if `ssl_certificate` points at a file that does not exist, and Let's
Encrypt only issues that file once nginx is answering the challenge on port 80. So
`nginx/docker-entrypoint.d/40-tls-when-certificate-exists.sh` keeps the HTTPS vhosts out of
`conf.d` until the certificate is on disk — which is why the certificate step comes after
the first `up`, and why nginx needs a restart afterwards. It re-checks on every start, so
this never has to be done twice.

# Debug

Check what is running, and what it said:

```bash
docker compose ps
```

```bash
docker compose logs -f nginx
```

Check the nginx config, rendered with your domain substituted in:

```bash
docker compose exec nginx nginx -t
```

Rebuild from nothing. Containers and images are disposable; `back/pb_data` and
`nginx/certbot` are untouched:

```bash
docker compose down && docker compose build --no-cache && docker compose up -d
```

More symptoms and fixes in [DEPLOYMENT.md](DEPLOYMENT.md#when-something-is-wrong).
