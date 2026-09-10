import tailwindcss from "@tailwindcss/vite";
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
// @ts-expect-error -- plain JS module, shared with vitest.config.ts and the arch lint.
import { aliases } from '../scripts/aliases.mjs';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        tailwindcss()
    ],
    server: {
        host: true,
        port: Number(process.env.PORT),
        watch: {
            usePolling: true
        }
    },
    resolve: {
        // Workspace packages are aliased to source rather than resolved through node_modules,
        // which keeps .vue subpath resolution simple and gives HMR across package boundaries.
        // The map lives in scripts/aliases.mjs; lint:arch checks it against the tsconfig paths.
        alias: aliases,
    },
})
