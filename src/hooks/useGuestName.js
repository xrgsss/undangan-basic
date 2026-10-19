import { useEffect, useMemo, useState } from 'react'
import { weddingConfig } from '../data/weddingConfig'
import { getGuestNameFromUrl } from '../lib/utils'

/* ============================================================================
 *  useGuestName — nama tamu dari parameter URL.
 *  Contoh tautan: https://undangan.example.com/?to=Bapak%20Andi
 *  Bila parameter tidak ada / kosong, dipakai nama default dari konfigurasi.
 * ========================================================================== */
export function useGuestName() {
  const fromUrl = useMemo(() => getGuestNameFromUrl(), [])
  const [name, setName] = useState(fromUrl)

  useEffect(() => {
    if (fromUrl) {
      try {
        window.sessionStorage.setItem('undangan:guest', fromUrl)
      } catch {
        /* storage bisa diblokir pada mode private — abaikan */
      }
      return
    }
    try {
      const cached = window.sessionStorage.getItem('undangan:guest')
      if (cached) setName(cached)
    } catch {
      /* abaikan */
    }
  }, [fromUrl])

  const resolved = (name || weddingConfig.meta.defaultGuest || 'Tamu Undangan').trim()
  return { guestName: resolved, hasUrlGuest: Boolean(fromUrl) }
}

export default useGuestName
