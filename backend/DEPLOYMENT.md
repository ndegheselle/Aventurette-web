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
- [11. Automatic deploys](#11-automatic-deploys)
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
                       api/pb_data          the only state on the host
```

Only `nginx` publishes ports. `front` and `api` have no route from the internet except
through it, so PocketBase is never exposed directly.

Two things hold everything site-specific:

| Path | Holds | In git? |
|---|---|---|
| `.env` | the domain and the certbot email | no — you create it |
| `api/pb_data/` | database, uploaded files, PocketBase settings | no — created on first run |

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
git clone https://github.com/ndegheselle/Aventurette-web.git ~/Aventurette-web && cd ~/Aventurette-web/backend
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
sh scripts/init-certificate.sh
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
`api/migrations/` and was applied automatically when the container started. Automigrate is
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

## 11. Automatic deploys

From here on, a push to the `production` branch deploys.
[.github/workflows/deploy.yml](../.github/workflows/deploy.yml) runs the same check as every
other push. If it passes, the workflow connects to the server over SSH and runs
[scripts/deploy.sh](scripts/deploy.sh), which does four things:

1. checks out `origin/production`;
2. builds the images while the current version keeps serving;
3. backs up `api/pb_data` with [scripts/backup.sh](scripts/backup.sh);
4. restarts on the new images. Migrations run as the api starts.

If any step fails, the script stops and the running version stays up.

Set it up once.

**A key just for GitHub.** On the server, as your user:

```bash
ssh-keygen -t ed25519 -N '' -C github-deploy -f ~/.ssh/github-deploy
```

Allow it in `~/.ssh/authorized_keys`, pinned to the deploy script. Whatever the client asks
for, this key can only run `deploy.sh`:

```bash
echo "command=\"sh $HOME/Aventurette-web/backend/scripts/deploy.sh\",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty $(cat ~/.ssh/github-deploy.pub)" >> ~/.ssh/authorized_keys
```

**The secrets.** On GitHub, under *Settings > Environments*, create an environment named
`production` and add these four secrets to it:

| Secret | Value |
|---|---|
| `DEPLOY_KEY` | the private key: `cat ~/.ssh/github-deploy` |
| `DEPLOY_HOST` | the server's IP |
| `DEPLOY_USER` | `nicolas` |
| `DEPLOY_KNOWN_HOSTS` | the output of `ssh-keyscan <server-ip>`, run from your own machine |

Then delete the private key from the server. GitHub has its own copy now:

```bash
rm ~/.ssh/github-deploy
```

**The branch.** From your own machine:

```bash
git push origin main:production
```

That push is also the first automatic deploy. Follow it under the *Actions* tab. The
server's checkout switches to a local `production` branch, and it stays on that branch from
then on.

## Running it from here

Deploy a new version, from your own machine:

```bash
git push origin main:production
```

Or by hand on the server. It is the same script the workflow runs, so it skips the check:

```bash
sh ~/Aventurette-web/backend/scripts/deploy.sh
```

Only changed images are rebuilt. `api/pb_data` and the certificates are untouched, so a
deploy is safe to run whenever.

Rebuild the front bundle after changing the domain in `.env`:

```bash
docker compose up -d --build front
```

### Back up

`api/pb_data` is the entire application state, and every deploy archives it first into
`backups/pb_data-<date>.tar.gz`. The last 10 archives are kept. To take one outside a deploy:

```bash
sh scripts/backup.sh
```

The script stops the api for the few seconds the archive takes. A copy taken while
PocketBase is running would not be consistent, because SQLite may still have writes in its
WAL. The scheduled snapshots from the admin UI (*Settings > Backups*, see
[step 9](#9-set-up-pocketbase)) are separate and land in `api/pb_data/backups`.

Both folders live on the server, so copy them off from time to time, from your own machine:

```bash
scp -r nicolas@<server-ip>:Aventurette-web/backend/backups .
```

### Restore a backup

To undo a deploy whose migration went wrong, push `production` back to the last good commit.
That brings back the old code, but the database keeps the new schema. Then restore the
archive taken before the bad deploy. That is the second-newest one, because the rollback
deploy took a backup too. From `backend/`:

```bash
docker compose stop api
```

```bash
docker compose run --rm --no-deps -v "$PWD/backups:/backups" --entrypoint sh api -c 'find /app/pb_data -mindepth 1 -maxdepth 1 ! -name backups -exec rm -rf {} + && tar xzf /backups/pb_data-<date>.tar.gz -C /app'
```

```bash
docker compose start api
```

This replaces everything in `pb_data` except PocketBase's own `backups/` folder. That folder
is not in the archive, so it is kept as it is.

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

**A deploy failed.** The workflow log under *Actions* shows the output of `deploy.sh`, and
the `==>` lines show which step stopped it. The running version is still the previous one. If
the backup failed, the api was started again anyway. If it is `Permission denied (publickey)`,
check the `authorized_keys` line and the `DEPLOY_*` secrets from
[step 11](#11-automatic-deploys).

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
`sh scripts/init-certificate.sh`. Let's Encrypt allows 5 failures per hostname per hour, so
do not retry in a loop.

**HTTPS still off after a successful request.** The vhosts are only installed on container
start: `docker compose restart nginx`.

**The site loads but every API call fails.** Check which host the browser is calling.
`VITE_API_URL` is compiled into the bundle at build time, so a wrong `API_DOMAIN` survives
restarts — fix `.env`, then `docker compose up -d --build front`.

**The front build is killed partway through.** Out of memory, see
[step 4](#4-swap-if-the-server-is-small).

**Reset the containers without touching data.** Images and containers are disposable;
`api/pb_data` and `nginx/certbot` are not, and nothing below touches them:

```bash
docker compose down && docker compose build --no-cache && docker compose up -d
```
