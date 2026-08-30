import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {execSync} from 'child_process';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function buildStamp() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig(() => {
  return {
    define: {
      __APP_BUILD__: JSON.stringify(buildStamp()),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['icons/*.png', 'images/*.jpg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              // Google Fonts: keep the app's visual identity offline after first visit.
              urlPattern: ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
          ],
        },
        manifest: {
          name: 'Oslo Residencial — Portal do Condomínio',
          short_name: 'Oslo',
          description: 'Avisos, ocorrências, caixa e indicações do condomínio.',
          lang: 'pt-BR',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#FBF9F6',
          theme_color: '#FBF9F6',
          categories: ['lifestyle', 'utilities', 'business'],
          icons: [
            {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png'},
            {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png'},
            {src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
            {src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png'},
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});