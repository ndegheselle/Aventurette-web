# Aventurette

An npm workspace rooted in `frontend/`: the `frontend/web/` app on top of three
`frontend/packages/`, and a PocketBase backend in `backend/api/`.

| | |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | the layout, and the boundaries between the parts |
| [docs/adr/](docs/adr/README.md) | why it is that way — one file per decision |
| [docs/features/](docs/features/README.md) | what each feature does, and what is not finished |
| [docs/coding-guidelines.md](docs/coding-guidelines.md) | how to write code that stays simple to read |
| [docs/testing.md](docs/testing.md) | how to test any of it |
| [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) | putting it on a server |

Live at [lubriciel.ovh](https://lubriciel.ovh), with the API on
[api.lubriciel.ovh](https://api.lubriciel.ovh).

# First setup

## Setup

Get the app. The `chapelure` library used to be a git submodule and is now a workspace
package, so no `--recurse-submodules` is needed:

```bash
git clone https://github.com/ndegheselle/Aventurette-web.git
```

Install once from `frontend/` — the workspace owns the lockfile, so do not run
`npm install` inside `frontend/web/`:

```bash
cd Aventurette-web/frontend && npm install
```

Create the dev server's env file. This one points at a local PocketBase; the deployed domain
lives in `backend/.env` instead (see below):

```bash
cp frontend/web/.env.example frontend/web/.env
```

## Develop

From `frontend/`:

```bash
npm run dev            # dev server
npm run build          # typecheck (app, packages and specs) and build
npm run test           # the test suite
npm run test:watch     # the suite, while working
npm run lint:arch      # architecture boundaries
npm run check          # all three — what CI runs
```

The API runs separately, from `backend/api/` — see [backend/api/readme.md](backend/api/readme.md).

# Deploy

**Setting up a new server: follow [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md).** It goes from a bare VPS
to a working HTTPS site. What follows is the summary and the day-to-day commands, all run from `backend/`.

## The stack

`backend/compose.yml` runs four containers on one internal network. Only `nginx` publishes ports, so
neither the SPA nor PocketBase is reachable from the internet except through it:

| Service | Built from | Role |
|---|---|---|
| `nginx` | `backend/nginx/Dockerfile` | TLS termination, ACME challenge, routing by hostname |
| `front` | `frontend/web/Dockerfile` | the built SPA, on the internal network only |
| `api` | `backend/api/Dockerfile` | PocketBase, compiled from `backend/api/` |
| `certbot` | `certbot/certbot` | certificate renewal, every 12h |

## Configuration

One file, `backend/.env`, holds everything site-specific:

```bash
cp .env.example .env
```

```
DOMAIN=lubriciel.ovh
API_DOMAIN=api.lubriciel.ovh
CERTBOT_EMAIL=nicolas@degheselle.com
```

The domain is written nowhere else. `DOMAIN` and `API_DOMAIN` are substituted into
`backend/nginx/templates/*.template` when the nginx container starts, used by
`backend/scripts/init-certificate.sh` to request the certificate, and combined into the
`VITE_API_URL` that Vite inlines into the front bundle.

Because Vite inlines it at *build* time, changing the domain needs a rebuild of the front
image, not just a restart:

```bash
docker compose up -d --build front
```

> `frontend/web/.env` is a different file, for the local dev server only. It is kept out of the
> Docker build context so a localhost value can never end up in a production bundle.

## Deploy an update

```bash
git pull && docker compose up -d --build
```

Only changed images are rebuilt. The two things that hold state — `backend/api/pb_data` and
`backend/nginx/certbot` — are host directories, so no rebuild can lose them.

## HTTPS

The first certificate is issued once, with the stack already running:

```bash
sh scripts/init-certificate.sh && docker compose restart nginx
```

One certificate covers both hostnames. Renewal is automatic from then on: the `certbot`
container renews every 12h and the nginx container reloads on the same cadence.

nginx will not start if `ssl_certificate` points at a file that does not exist, and Let's
Encrypt only issues that file once nginx is answering the challenge on port 80. So
`backend/nginx/docker-entrypoint.d/40-tls-when-certificate-exists.sh` keeps the HTTPS vhosts out of
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

Rebuild from nothing. Containers and images are disposable; `backend/api/pb_data` and
`backend/nginx/certbot` are untouched:

```bash
docker compose down && docker compose build --no-cache && docker compose up -d
```

More symptoms and fixes in [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md#when-something-is-wrong).
