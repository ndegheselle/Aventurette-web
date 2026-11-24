import { defineConfig } from 'vite';
// @ts-expect-error -- plain JS module, shared with vite.config.ts and the arch lint.
import { aliases } from '../../backend/scripts/aliases.mjs';

/**
 * The MCP server: the same features as the back office, built for Node from `src/mcp/main.ts`.
 * An SSR build, so `import.meta.env.SSR` is true and the session lives in memory; the packages
 * under node_modules stay external and are read from there when it runs.
 */
export default defineConfig({
    resolve: { alias: aliases },
    // The back office's static files have nothing to do with a server.
    publicDir: false,
    // Read when the server starts rather than inlined at build: one build serves any backend.
    define: { 'import.meta.env.VITE_API_URL': 'process.env.API_URL' },
    build: {
        ssr: 'src/mcp/main.ts',
        outDir: 'dist-mcp',
        emptyOutDir: true,
        target: 'node22',
        rollupOptions: { output: { entryFileNames: 'server.mjs' } },
    },
});
