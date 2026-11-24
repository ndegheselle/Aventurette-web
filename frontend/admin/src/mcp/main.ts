/// <reference types="node" />
/**
 * The MCP server's composition root: what `app/main.ts` is to the back office. It reads its
 * settings, then hands over to `server.ts` — imported once they are checked, since importing it
 * builds the backend client from `API_URL`.
 *
 * Built by `npm run build:mcp` into `dist-mcp/server.mjs`; see docs/mcp.md.
 */
const settings = {
    API_URL: process.env.API_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};

const missing = Object.entries(settings).filter(([, value]) => !value).map(([name]) => name);
if (missing.length) {
    // stdout is the protocol's: everything said to a person goes to stderr.
    console.error(`aventurette MCP: set ${missing.join(', ')} in the server's environment.`);
    process.exit(1);
}

const { startServer } = await import('@/mcp/server');
await startServer({
    email: settings.ADMIN_EMAIL!,
    password: settings.ADMIN_PASSWORD!,
    adminUrl: process.env.ADMIN_URL ?? '',
});
