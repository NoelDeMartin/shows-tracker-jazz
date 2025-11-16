import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@modyfi/vite-plugin-yaml';
import spaRedirect from 'vite-plugin-spa-redirect';
import { defineConfig } from 'vite';

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/shows-tracker-jazz/' : '/',
    build: { sourcemap: true },
    plugins: [react(), tailwindcss(), yaml(), spaRedirect()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
