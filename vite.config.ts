import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/shows-tracker-jazz/' : '/',
    plugins: [react(), tailwindcss(), yaml()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
