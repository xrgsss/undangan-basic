import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  // Kasus sangat jarang: index.html tidak memiliki #root.
  document.body.innerHTML =
    '<p style="font-family:sans-serif;padding:2rem">Struktur halaman tidak valid: elemen #root tidak ditemukan.</p>'
} else {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
