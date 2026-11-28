import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',          // the phone's WebView understands modern code, so less is rewritten and it starts faster
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // React and the other libraries rarely change, so they are kept apart from the app code
        manualChunks: (id) => (id.includes('node_modules') ? (/react|scheduler/.test(id) ? 'react' : 'vendor') : undefined),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
