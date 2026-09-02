import tailwindcss from "@tailwindcss/vite";
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

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
        // Keep in sync with the tsconfig paths.
        alias: {
            '@chapelure/core': fileURLToPath(new URL('../packages/core/src', import.meta.url)),
            '@chapelure/pocketbase': fileURLToPath(new URL('../packages/pocketbase/src', import.meta.url)),
            '@chapelure/ui': fileURLToPath(new URL('../packages/ui/src', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
