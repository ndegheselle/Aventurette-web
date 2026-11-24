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

Rebuild both bundles after changing `API_DOMAIN` in `.env`, since it is compiled into them:

```bash
docker compose up -d --build app admin
```