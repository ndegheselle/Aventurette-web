import tailwindcss from "@tailwindcss/vite";
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
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
        // Vite matches aliases in declaration order, so the more specific package entries
        // MUST stay above the legacy '@chapelure' entry. Keep in sync with tsconfig paths.
        alias: {
            '@chapelure/core': fileURLToPath(new URL('../packages/core/src', import.meta.url)),
            '@chapelure/pocketbase': fileURLToPath(new URL('../packages/pocketbase/src', import.meta.url)),
            '@chapelure/ui': fileURLToPath(new URL('../packages/ui/src', import.meta.url)),
            '@chapelure': fileURLToPath(new URL('./src/chapelure', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
