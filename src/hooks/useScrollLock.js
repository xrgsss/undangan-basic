import { useEffect } from 'react'

/* ============================================================================
 *  useScrollLock — kunci scroll halaman (dipakai saat cover & lightbox terbuka).
 *  Mengunci body sekaligus menyimpan posisi scroll agar tidak "melompat".
 * ========================================================================== */
export function useScrollLock(locked, className = 'invitation-locked') {
  useEffect(() => {
    if (!locked) return undefined
    const { body } = document
    const scrollY = window.scrollY
    const previousOverflow = body.style.overflow
    const previousPosition = body.style.position
    const previousTop = body.style.top
    const previousWidth = body.style.width

    body.classList.add(className)
    // Fallback untuk browser lama (iOS Safari) yang mengabaikan overflow: hidden.
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'

    return () => {
      body.classList.remove(className)
      body.style.overflow = previousOverflow
      body.style.position = previousPosition
      body.style.top = previousTop
      body.style.width = previousWidth
      window.scrollTo({ top: scrollY, behavior: 'auto' })
    }
  }, [locked, className])
}

export default useScrollLock
