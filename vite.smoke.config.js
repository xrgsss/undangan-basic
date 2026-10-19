import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Konfigurasi khusus untuk `npm run smoke`:
 * membangun bundel SSR dari scripts/smoke-render.jsx agar seluruh pohon
 * komponen dapat diuji tanpa membuka browser.
 */
export default defineConfig({
  plugins: [react()],
  logLevel: 'warn',
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: 'scripts/smoke-render.jsx',
    outDir: '.smoke',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: 'smoke-render.mjs',
        format: 'es',
      },
    },
  },
})
