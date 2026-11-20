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

## Moving from one site to `app.` and `admin.`

The back office used to be served on the bare domain, from a `front` container. On a server set
up before the split, once:

1. Add two A records, `app` and `admin`, pointing at the server
   ([first setup, step 1](first-setup.md#1-point-the-domain-at-the-server)).
2. Add `APP_DOMAIN` and `ADMIN_DOMAIN` to `backend/.env` (see `backend/.env.example`). Until they
   are there, compose refuses to start and the deploy fails, with the old version still serving.
3. Deploy. `deploy.sh` removes the old `front` container on its own.
4. Extend the certificate to the new hostnames, then load it:

   ```bash
   sh scripts/init-certificate.sh && docker compose restart nginx
   ```

Between steps 3 and 4 the new hostnames answer with a certificate that does not name them.