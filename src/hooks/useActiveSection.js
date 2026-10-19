import { useEffect, useRef, useState } from 'react'

/* ============================================================================
 *  useActiveSection — scroll-spy untuk indikator menu aktif pada navigasi.
 *  Implementasi memakai satu listener scroll (passive) + requestAnimationFrame
 *  agar tetap ringan di perangkat kelas menengah.
 * ========================================================================== */
export function useActiveSection(ids = [], { enabled = true, offset = 0.38 } = {}) {
  const [activeId, setActiveId] = useState(ids[0] ?? '')
  const frameRef = useRef(0)
  const idsKey = ids.join('|')

  useEffect(() => {
    if (!enabled || !idsKey) return undefined
    const list = idsKey.split('|')

    const measure = () => {
      frameRef.current = 0
      const viewport = window.innerHeight
      const anchor = window.scrollY + viewport * offset
      let current = list[0]

      for (const id of list) {
        const element = document.getElementById(id)
        if (!element) continue
        const top = element.getBoundingClientRect().top + window.scrollY
        if (top <= anchor) current = id
      }

      // Di dasar halaman, paksa section terakhir menjadi aktif
      // (section terakhir sering tidak pernah melewati titik anchor).
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) current = list[list.length - 1]

      setActiveId((prev) => (prev === current ? prev : current))
    }

    const onScroll = () => {
      if (frameRef.current) return
      frameRef.current = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, idsKey, offset])

  return activeId
}

export default useActiveSection
