# Saving an activity with Claude

Write the fiche in Markdown from the Confluence template, then ask Claude:

> Save `C:\fiches\chasse-aux-couleurs.md` as an activity.

Claude reads the fiche, saves it as a **draft**, and answers with the editor link and what the
fiche left empty. Finish it in the editor. The files the fiche points at (cover image, step
resources) are uploaded if they are next to it on your disk.

Only an **admin** account can use it. Why it works this way:
[ADR 0026](adr/0026-activities-are-saved-through-an-mcp-server.md).

## Set it up

Build the server once, and again after each pull:

```bash
cd frontend && npm install && npm run build:mcp
```

Then add it to your MCP client. For **Claude Code**, in `.mcp.json` at the root of any project
you work from (or with `claude mcp add`):

```json
{
    "mcpServers": {
        "aventurette": {
            "command": "node",
            "args": ["C:/path/to/Aventurette-web/frontend/admin/dist-mcp/server.mjs"],
            "env": {
                "API_URL": "http://127.0.0.1:8090",
                "ADMIN_URL": "http://localhost:5173",
                "ADMIN_EMAIL": "you@example.com",
                "ADMIN_PASSWORD": "your password"
            }
        }
    }
}
```

For **Claude Desktop**, put the same `mcpServers` entry in `claude_desktop_config.json`
(*Settings → Developer → Edit Config*).

| Variable | |
|---|---|
| `API_URL` | the PocketBase to write to. Local, or production's API domain. |
| `ADMIN_URL` | the back office, used to build the editor link. Optional: without it, the answer gives the activity's id. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | an admin account of that PocketBase. Never commit them: keep this entry in your user configuration, or in a `.mcp.json` that git ignores. |

To switch between local and production, add a second entry with the other `API_URL`.

## What it offers

| Tool | |
|---|---|
| `list_references` | the tags, safety instructions, tips and materials that already exist |
| `save_activity` | saves a fiche as a draft. Its description holds the rules for reading a fiche. |

The format and the rules live in
`frontend/admin/src/features/activities-authoring/mcp/`: `activity-sheet.schema.json` and
`instructions.md`. Change them there, then rebuild.

## When it fails

- **"set API_URL, … in the server's environment"**: a variable is missing from the entry.
- **"… is not an admin"**: the account signed in, but its role is not `ADMIN`.
- **"Nothing was saved"**: the fiche had problems, listed in the answer. Claude usually fixes
  them and tries again.
- **"Batch requests are not allowed"**: the PocketBase has batching off, so its migrations have
  not run. Restart it, or turn on *Settings → Application → Batch API*. Safety instructions and
  tips the failed save created stay, and the next save reuses them.
- **Errors after a week**: the session expired. Restart the client.
