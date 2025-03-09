import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5050',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // Ensure relative paths for assets
        base: './',
        // Optimize for production
        minify: 'terser',
        // Generate sourcemaps for easier debugging
        sourcemap: process.env.NODE_ENV !== 'production',
        // Improve chunk loading strategy for better performance
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
                },
            },
        },
    },
});