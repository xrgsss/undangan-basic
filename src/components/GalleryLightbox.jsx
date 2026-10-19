import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import useScrollLock from '../hooks/useScrollLock'
import { weddingConfig } from '../data/weddingConfig'

/* ============================================================================
 *  GalleryLightbox — penampil foto layar penuh.
 *  • Navigasi: tombol, keyboard (← → Esc), dan geser (swipe) di ponsel.
 *  • Fokus keyboard terjaga: fokus dipindah ke dialog lalu dikembalikan
 *    ke elemen pemicu saat ditutup.
 *  • Scroll halaman dikunci selama lightbox terbuka.
 *  • Dirender lewat portal ke <body> agar berada di atas navigasi tetap
 *    (kalau hanya dirender di dalam <main>, z-index-nya "terkurung" oleh
 *    stacking context milik <main> dan navigasi bawah akan menutupinya).
 *  Render di dalam <AnimatePresence> milik GallerySection.
 * ========================================================================== */
export default function GalleryLightbox({ photos = [], index = 0, onClose, onPrev, onNext }) {
  const reduce = useReducedMotion()
  const containerRef = useRef(null)
  const restoreFocusRef = useRef(null)

  const total = photos.length
  const photo = photos[index]

  useScrollLock(true)

  const goPrev = useCallback(() => {
    onPrev?.()
  }, [onPrev])

  const goNext = useCallback(() => {
    onNext?.()
  }, [onNext])

  // Keyboard: Escape, ArrowLeft, ArrowRight, Tab tetap di dalam dialog.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      } else if (event.key === 'Tab') {
        // Fokus sederhana: hanya elemen di dalam dialog yang bisa di-Tab.
        const focusables = containerRef.current?.querySelectorAll('button:not([disabled])')
        if (!focusables || focusables.length === 0) return
        const list = Array.from(focusables)
        const first = list[0]
        const last = list[list.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    restoreFocusRef.current = document.activeElement
    const timer = window.setTimeout(() => {
      containerRef.current?.querySelector('[data-autofocus]')?.focus({ preventScroll: true })
    }, 80)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
      const previous = restoreFocusRef.current
      if (previous && typeof previous.focus === 'function') previous.focus({ preventScroll: true })
    }
  }, [goNext, goPrev, onClose])

  if (!photo) return null

  const caption = photo.caption || photo.alt || `Foto ${index + 1}`

  const overlay = (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[95] flex flex-col bg-[rgba(43,38,32,0.94)] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeri foto, ${index + 1} dari ${total}`}
      onClick={onClose}
    >
      {/* Bilah atas */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 safe-top" onClick={(event) => event.stopPropagation()}>
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-ivory-100/80">
          {`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden font-serif text-xs italic text-ivory-100/70 sm:block">
            Geser atau gunakan tombol ← → untuk berpindah
          </span>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-ivory-100/25 text-ivory-100 transition-colors hover:bg-ivory-100/12"
            aria-label="Tutup galeri"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      </div>

      {/* Area foto */}
      <div className="relative flex flex-1 items-center justify-center px-3 pb-4 sm:px-10">
        {total > 1 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              goPrev()
            }}
            className="absolute left-1 z-10 grid h-11 w-11 place-items-center rounded-full border border-ivory-100/25 bg-[rgba(43,38,32,0.35)] text-ivory-100 transition-colors hover:bg-ivory-100/15 sm:left-3"
            aria-label="Foto sebelumnya"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
        ) : null}

        <motion.figure
          key={index}
          className="flex max-h-full w-full max-w-4xl flex-col items-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
        >
          <motion.img
            src={photo.src}
            alt={photo.alt || `Foto prewedding ${index + 1}`}
            className="max-h-[68vh] w-auto max-w-full rounded-xl border border-ivory-100/15 object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] sm:max-h-[74vh]"
            drag={total > 1 && !reduce ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={(_, info) => {
              if (info.offset.x < -64) goNext()
              else if (info.offset.x > 64) goPrev()
            }}
            draggable={false}
          />
          <figcaption className="mt-4 max-w-xl text-center">
            <span className="block font-serif text-base italic text-ivory-100/90 sm:text-lg">{caption}</span>
            <span className="mt-1 block font-sans text-[10px] uppercase tracking-[0.28em] text-champagne-300">
              {weddingConfig.meta.shortTitle}
            </span>
          </figcaption>
        </motion.figure>

        {total > 1 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              goNext()
            }}
            className="absolute right-1 z-10 grid h-11 w-11 place-items-center rounded-full border border-ivory-100/25 bg-[rgba(43,38,32,0.35)] text-ivory-100 transition-colors hover:bg-ivory-100/15 sm:right-3"
            aria-label="Foto berikutnya"
          >
            <Icon name="chevronRight" size={20} />
          </button>
        ) : null}
      </div>
    </motion.div>
  )

  // Portal ke <body> agar z-index tidak terkurung stacking context <main>.
  return typeof document === 'undefined' ? overlay : createPortal(overlay, document.body)
}
