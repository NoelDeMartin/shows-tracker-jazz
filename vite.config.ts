import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/shows-tracker-jazz/' : '/',
    plugins: [react(), tailwindcss()],
});
