import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

const spaFallbackPlugin = () => ({
  name: 'spa-fallback-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.method !== 'GET') return next();
      const pathname = (req.url || '').split('?')[0];
      if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/src') ||
        pathname.startsWith('/node_modules') ||
        path.extname(pathname)
      ) {
        return next();
      }

      try {
        const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await server.transformIndexHtml(req.url, rawHtml);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
      } catch (err) {
        next(err);
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Production optimisations
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // In development, proxy /api/* to the backend so cookies are same-origin.
      // Leave VITE_API_URL unset (or set to '') in your .env.development.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
