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
        alias: {
            '@chapelure': fileURLToPath(new URL('./src/features/@chapelure', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/features/@shared', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
