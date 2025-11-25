import icons from 'unplugin-icons/vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import spaRedirect from 'vite-plugin-spa-redirect';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@modyfi/vite-plugin-yaml';
import { createHtmlPlugin as html } from 'vite-plugin-html';
import { defineConfig } from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';

const appName = 'Shows Tracker';
const appDescription = 'Keep track of your favorite shows';
const basePath = process.env.NODE_ENV === 'production' ? '/shows-tracker-jazz/' : '/';
const themeColor = '#ff4081';

export default defineConfig({
    base: basePath,
    build: { sourcemap: true },
    plugins: [
        react(),
        tailwindcss(),
        icons({ compiler: 'jsx', jsx: 'react' }),
        yaml(),
        spaRedirect(),
        html({
            inject: {
                data: {
                    appName,
                    basePath,
                    themeColor,
                },
            },
        }),
        pwa({
            registerType: 'autoUpdate',
            includeAssets: ['apple-touch-icon.png', 'favicon-32x32.png', 'favicon-16x16.png', 'safari-pinned-tab.svg'],
            manifest: {
                name: appName,
                short_name: appName,
                description: appDescription,
                theme_color: themeColor,
                icons: [
                    { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
