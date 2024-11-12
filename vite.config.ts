import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Security headers middleware with development-friendly CSP
const securityHeaders = () => ({
  name: 'security-headers',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Allow WebContainer domains in development
      const webContainerHost = req.headers.host || '';
      const isWebContainer = webContainerHost.includes('webcontainer') || webContainerHost.includes('stackblitz');

      // Set security headers
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', isWebContainer ? 'ALLOW-FROM *' : 'SAMEORIGIN');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
      
      // Development-friendly CSP
      const cspDirectives = [
        "default-src 'self' https: http: ws: wss:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
        "style-src 'self' 'unsafe-inline' https: http:",
        "img-src 'self' data: blob: https: http:",
        "font-src 'self' data: https: http:",
        "connect-src 'self' https: http: ws: wss:",
        "media-src 'self' https: http:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self' https: http:",
        isWebContainer ? '' : 'upgrade-insecure-requests'
      ].filter(Boolean).join('; ');

      res.setHeader('Content-Security-Policy', cspDirectives);

      next();
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    securityHeaders()
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    hmr: {
      protocol: 'ws'
    }
  }
});