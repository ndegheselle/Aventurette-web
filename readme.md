# Aventurette

Ajil — the clients' Flutter app in `frontend/mobile/`, the back office in `frontend/admin/` (an npm
workspace rooted in `frontend/`, on top of three `frontend/packages/`), and a PocketBase backend
in `backend/api/` that both talk to.

| | |
|---|---|
| [docs/business/](docs/business/README.md) | what the clients' app does, screen by screen, whatever it is built with |
| [docs/architecture.md](docs/architecture.md) | how the parts talk, and how to change the mobile app's technology |
| [docs/adr/](docs/adr/README.md) | why it is that way — one file per decision |
| [docs/coding-guidelines.md](docs/coding-guidelines.md) | how to write code that stays simple to read |
| [docs/testing.md](docs/testing.md) | how to test any of it |
| [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) | putting it on a server |

Live at [app.lubriciel.ovh](https://app.lubriciel.ovh) (the clients' app, built for the web) and
[admin.lubriciel.ovh](https://admin.lubriciel.ovh) (the back office), with the API on
[api.lubriciel.ovh](https://api.lubriciel.ovh). The bare [lubriciel.ovh](https://lubriciel.ovh)
redirects to the clients' app.

# First setup

## Setup

Get the app. The `chapelure` library used to be a git submodule and is now a workspace
package, so no `--recurse-submodules` is needed:

```bash
git clone https://github.com/ndegheselle/Aventurette-web.git
```

Install once from `frontend/` — the workspace owns the lockfile, so do not run
`npm install` inside `frontend/admin/`:

```bash
cd Aventurette-web/frontend && npm install
```

Create the dev server's env file. This one points at a local PocketBase; the deployed domain
lives in `backend/.env` instead (see below):

```bash
cp frontend/admin/.env.example frontend/admin/.env
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

## The mobile app

Flutter 3.50 or later. From `frontend/mobile/`, once:

```bash
flutter pub get
```

Then, against a PocketBase running locally:

```bash
flutter run -d chrome --dart-define=API_URL=http://127.0.0.1:8090
```

Or in a Windows window, which needs Visual Studio with the *Desktop development with C++* workload:

```bash
flutter run -d windows --dart-define=API_URL=http://127.0.0.1:8090
```

Or on Android, which needs Android Studio with an SDK and an emulator (or a phone with USB
debugging). The emulator reaches the computer at `10.0.2.2`; a phone needs the computer's
address on the local network, with PocketBase started on `--http=0.0.0.0:8090`. `flutter devices`
lists the device id; the first emulator is `emulator-5554`:

```bash
flutter run -d emulator-5554 --dart-define=API_URL=http://10.0.2.2:8090
```

Plain `http` is only allowed in debug builds; a release build needs an `https` API.

```bash
dart run tool/check_architecture.dart && flutter analyze && flutter test
```

How it is built: [docs/architecture.md](docs/architecture.md#the-mobile-app). What it does:
[docs/business/](docs/business/README.md).

# Deploy

**Setting up a new server: follow [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md).** It goes from a bare VPS
to a working HTTPS site. What follows is the summary and the day-to-day commands, all run from `backend/`.

## The stack

`backend/compose.yml` runs five containers on one internal network. Only `nginx` publishes ports, so
neither app nor PocketBase is reachable from the internet except through it:

| Service | Built from | Served on | Role |
|---|---|---|---|
| `nginx` | `backend/nginx/Dockerfile` | every domain | TLS termination, ACME challenge, routing by hostname |
| `app` | `frontend/mobile/Dockerfile` | `APP_DOMAIN` | the Flutter app's web build, on the internal network only |
| `admin` | `frontend/admin/Dockerfile` | `ADMIN_DOMAIN` | the back office's built SPA, on the internal network only |
| `api` | `backend/api/Dockerfile` | `API_DOMAIN` | PocketBase, compiled from `backend/api/` |
| `certbot` | `certbot/certbot` | — | certificate renewal, every 12h |

`DOMAIN` itself redirects to `APP_DOMAIN`. The manager app of
[ADR 0025](docs/adr/0025-structures-are-managed-in-a-web-app.md) is not part of the stack yet.

## Configuration

One file, `backend/.env`, holds everything site-specific:

```bash
cp .env.example .env
```

```
DOMAIN=lubriciel.ovh
APP_DOMAIN=app.lubriciel.ovh
ADMIN_DOMAIN=admin.lubriciel.ovh
API_DOMAIN=api.lubriciel.ovh
CERTBOT_EMAIL=nicolas@degheselle.com
```

The domains are written nowhere else. They are substituted into
`backend/nginx/templates/*.template` when the nginx container starts and used by
`backend/scripts/init-certificate.sh` to request the certificate. `API_DOMAIN` also becomes the
`VITE_API_URL` that Vite inlines into the back office, and the `API_URL` that
`flutter build web --dart-define` compiles into the clients' app.

Because both are compiled in at *build* time, changing the API domain needs a rebuild of both
images, not just a restart:

```bash
docker compose up -d --build app admin
```

> `frontend/admin/.env` is a different file, for the local dev server only. It is kept out of the
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

One certificate, named after `DOMAIN`, covers every hostname. After adding a hostname to `.env`,
run the same command again: it extends the existing certificate. Renewal is automatic from then on: the `certbot`
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
