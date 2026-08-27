# Deploying on a fresh server

From an empty VPS to `https://lubriciel.ovh` and `https://api.lubriciel.ovh`. Written for
Debian 12 or Ubuntu 22.04/24.04; every command runs on the server unless it says otherwise.

Budget about 30 minutes, most of it waiting on the first Docker build.

- [What you are building](#what-you-are-building)
- [0. What you need first](#0-what-you-need-first)
- [1. Point the domain at the server](#1-point-the-domain-at-the-server)
- [2. Create a user and lock down SSH](#2-create-a-user-and-lock-down-ssh)
- [3. Firewall](#3-firewall)
- [4. Swap, if the server is small](#4-swap-if-the-server-is-small)
- [5. Install Docker](#5-install-docker)
- [6. Get the code and configure it](#6-get-the-code-and-configure-it)
- [7. First start, over HTTP](#7-first-start-over-http)
- [8. Get the certificate and turn on HTTPS](#8-get-the-certificate-and-turn-on-https)
- [9. Set up PocketBase](#9-set-up-pocketbase)
- [10. Check it works](#10-check-it-works)
- [Running it from here](#running-it-from-here)
- [When something is wrong](#when-something-is-wrong)

## What you are building

Four containers on one internal Docker network, defined in [compose.yml](compose.yml):

```
                     :80  :443
                       |
              +--------v--------+
              |      nginx      |   TLS, ACME challenge, routing by hostname
              +----+-------+----+
      lubriciel.ovh|       |api.lubriciel.ovh
              +----v---+ +-v------+        +----------+
              | front  | |  api   |        | certbot  |  renews every 12h
              |  SPA   | |PocketB.|        +----------+
              +--------+ +---+----+
                             |
                       back/pb_data          the only state on the host
```

Only `nginx` publishes ports. `front` and `api` have no route from the internet except
through it, so PocketBase is never exposed directly.

Two things hold everything site-specific:

| Path | Holds | In git? |
|---|---|---|
| `.env` | the domain and the certbot email | no — you create it |
| `back/pb_data/` | database, uploaded files, PocketBase settings | no — created on first run |

Everything else is rebuilt from the repository, so a rebuild can never lose data and these
two are all you have to back up.

## 0. What you need first

- A VPS with a public IPv4 address, root or sudo access, and at least 1 GB of RAM
  (see [step 4](#4-swap-if-the-server-is-small) if it is 1 GB).
- The `lubriciel.ovh` domain, with access to its DNS zone.
- An SSH key on your own machine. If you do not have one:

  ```bash
  ssh-keygen -t ed25519 -C "lubriciel"
  ```

## 1. Point the domain at the server

Do this first — DNS takes time to propagate, and Let's Encrypt will refuse to issue a
certificate until it resolves. In the OVH control panel, under *Domains > lubriciel.ovh >
DNS zone*, create two A records pointing at the server's IP:

| Type | Sub-domain | Target |
|---|---|---|
| A | *(empty)* | `<server-ip>` |
| A | `api` | `<server-ip>` |

Check from your own machine, not from the server, and wait until both answer with the
server's IP:

```bash
dig +short lubriciel.ovh
```

```bash
dig +short api.lubriciel.ovh
```

## 2. Create a user and lock down SSH

Log in as root, then create a user for yourself — the deploy does not need root beyond
installing Docker:

```bash
adduser nicolas
```

```bash
usermod -aG sudo nicolas
```

Copy your SSH key over, still as root:

```bash
mkdir -p /home/nicolas/.ssh && cp ~/.ssh/authorized_keys /home/nicolas/.ssh/ && chown -R nicolas:nicolas /home/nicolas/.ssh && chmod 700 /home/nicolas/.ssh && chmod 600 /home/nicolas/.ssh/authorized_keys
```

Open a **second** terminal and confirm `ssh nicolas@<server-ip>` works before going on — if
it does not, you still have the root session to fix it with.

Once it works, turn off password logins. In `/etc/ssh/sshd_config` set:

```
PasswordAuthentication no
PermitRootLogin no
```

```bash
sudo systemctl restart ssh
```

## 3. Firewall

Only SSH and the two web ports need to be reachable. The container ports do not — Docker
publishes 80 and 443 itself and everything else stays on the internal network.

```bash
sudo apt update && sudo apt install -y ufw
```

```bash
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

> Docker writes its own iptables rules and bypasses ufw for published ports. That is
> harmless here, because the only published ports are the two you just allowed anyway.

## 4. Swap, if the server is small

The front image runs `npm ci` and a Vite build inside Docker, which is the memory-hungriest
moment of the whole deploy. On a 1 GB server it gets killed without swap. Skip this step if
the server has 2 GB or more:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 5. Install Docker

From Docker's own repository — the distribution packages are too old for the Compose plugin:

```bash
sudo apt update && sudo apt install -y ca-certificates curl git
```

```bash
sudo install -m 0755 -d /etc/apt/keyrings && sudo curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg -o /etc/apt/keyrings/docker.asc && sudo chmod a+r /etc/apt/keyrings/docker.asc
```

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

```bash
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Let your user run Docker without sudo. The group only applies to new sessions, so log out
and back in afterwards:

```bash
sudo usermod -aG docker $USER
```

```bash
docker run --rm hello-world
```

## 6. Get the code and configure it

```bash
git clone https://github.com/ndegheselle/Aventurette-web.git ~/Aventurette-web && cd ~/Aventurette-web
```

There is no `npm install` here. The front image installs and builds inside Docker, so the
server never needs Node.

Now the one file to edit:

```bash
cp .env.example .env && nano .env
```

```
DOMAIN=lubriciel.ovh
API_DOMAIN=api.lubriciel.ovh
CERTBOT_EMAIL=nicolas@degheselle.com
```

That is the only place the domain is written. From there it reaches the nginx vhosts
(substituted into `nginx/templates/` on container start), the certificate request, and the
API URL baked into the front bundle. Nothing else needs changing to move the site to
another domain.

## 7. First start, over HTTP

```bash
docker compose up -d --build
```

The first build compiles PocketBase and the SPA and takes a few minutes; later ones reuse
the cache. When it finishes:

```bash
docker compose ps
```

All four containers should be `Up`, with `api` reaching `healthy` within a minute.

**nginx is serving HTTP only at this point, and that is correct.** It cannot start with the
HTTPS vhosts yet, because those name a certificate file that does not exist — and Let's
Encrypt will only create that file once nginx is answering the challenge on port 80. So the
entrypoint holds the HTTPS vhosts back until the certificate is there, and says so:

```bash
docker compose logs nginx | head
```

```
no certificate for lubriciel.ovh yet — serving HTTP only.
```

## 8. Get the certificate and turn on HTTPS

One certificate covers both hostnames. Confirm DNS resolves before running this — Let's
Encrypt rate-limits failed attempts:

```bash
./scripts/init-certificate.sh
```

The script reads the same `.env` and asks certbot for `DOMAIN` and `API_DOMAIN` over the
webroot the nginx container is already serving. On success it prints where the certificate
was written. Then:

```bash
docker compose restart nginx
```

```bash
docker compose logs nginx | head
```

```
certificate found for lubriciel.ovh — HTTPS enabled
```

That is the last manual step for TLS. The `certbot` container renews every 12h, and the
nginx container reloads itself on the same cadence, so a renewed certificate is picked up
without anyone touching the server.

## 9. Set up PocketBase

Create the first superuser:

```bash
docker compose exec api ./pocketbase superuser create admin@lubriciel.ovh 'a-long-password'
```

Open `https://api.lubriciel.ovh/_/` and log in with it. Then, in *Settings > Application*,
set the user IP proxy header to `X-Forwarded-For`. PocketBase is behind a reverse proxy, so
without this every request looks like it comes from the nginx container and rate limiting
and logging are useless — see
[the PocketBase docs](https://pocketbase.io/docs/going-to-production/#using-reverse-proxy).

While you are there, turn on *Settings > Backups* on a schedule.

You do not have to create collections. The schema is committed as migration files under
`back/migrations/` and was applied automatically when the container started. Automigrate is
off in a compiled binary, so the running server never writes schema of its own — schema
changes are made in development and deployed as code.

## 10. Check it works

```bash
curl -I https://lubriciel.ovh
```

```bash
curl -s https://api.lubriciel.ovh/api/health
```

```bash
curl -I http://lubriciel.ovh
```

The last one should be a `301` to `https://`. Then open `https://lubriciel.ovh` in a
browser, sign up, and confirm the request goes to `api.lubriciel.ovh` in the network tab.

## Running it from here

Deploy a new version:

```bash
cd ~/Aventurette-web && git pull && docker compose up -d --build
```

Only changed images are rebuilt. `back/pb_data` and the certificates are untouched, so this
is safe to run whenever.

Rebuild the front bundle after changing the domain in `.env`:

```bash
docker compose up -d --build front
```

Back up. `back/pb_data` is the entire application state. Take the snapshot from the admin UI
(*Settings > Backups*) rather than copying the files: SQLite may have writes sitting in its
WAL, so a file copy from under a running server is not guaranteed consistent. Snapshots land
in `back/pb_data/backups`, so from your own machine:

```bash
scp -r nicolas@<server-ip>:Aventurette-web/back/pb_data/backups .
```

Restart one service, or stop and start the lot:

```bash
docker compose restart nginx
```

```bash
docker compose down
```

```bash
docker compose up -d
```

## When something is wrong

Start here — which containers are up, and what did they say:

```bash
docker compose ps
```

```bash
docker compose logs -f nginx
```

**nginx keeps restarting.** Almost always a config error. Ask it:

```bash
docker compose exec nginx nginx -t
```

If it will not stay up long enough for that, look at the rendered vhosts — the templates
with your domain substituted in:

```bash
docker compose run --rm --entrypoint sh nginx -c 'cat /etc/nginx/conf.d/*.conf'
```

**The certificate request failed.** Confirm the challenge path is really reachable from
outside, over plain HTTP:

```bash
docker compose exec nginx sh -c 'echo hello > /var/www/certbot/test'
```

```bash
curl http://lubriciel.ovh/.well-known/acme-challenge/test
```

If that does not print `hello`, the problem is DNS, the firewall, or something else already
holding port 80 (`sudo ss -tlnp | grep :80`) — not certbot. Fix that, then re-run
`./scripts/init-certificate.sh`. Let's Encrypt allows 5 failures per hostname per hour, so
do not retry in a loop.

**HTTPS still off after a successful request.** The vhosts are only installed on container
start: `docker compose restart nginx`.

**The site loads but every API call fails.** Check which host the browser is calling.
`VITE_API_URL` is compiled into the bundle at build time, so a wrong `API_DOMAIN` survives
restarts — fix `.env`, then `docker compose up -d --build front`.

**The front build is killed partway through.** Out of memory, see
[step 4](#4-swap-if-the-server-is-small).

**Reset the containers without touching data.** Images and containers are disposable;
`back/pb_data` and `nginx/certbot` are not, and nothing below touches them:

```bash
docker compose down && docker compose build --no-cache && docker compose up -d
```
