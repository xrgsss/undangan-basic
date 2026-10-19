import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { weddingConfig } from '../data/weddingConfig'
import GalleryGrid from '../components/GalleryGrid'
import GalleryLightbox from '../components/GalleryLightbox'
import Icon from '../components/Icon'
import SectionShell from '../components/SectionShell'
import SectionHeading from '../components/SectionHeading'
import { Reveal } from '../components/Motion'

/* ============================================================================
 *  GallerySection — galeri foto prewedding + lightbox.
 *  Navigasi lightbox: tombol, keyboard (← → Esc), dan geser pada ponsel.
 * ========================================================================== */
export default function GallerySection() {
  const photos = weddingConfig.gallery.photos ?? []
  const [index, setIndex] = useState(null)
  const isOpen = index !== null

  const close = useCallback(() => setIndex(null), [])
  const goPrev = useCallback(
    () => setIndex((current) => (current === null ? current : (current - 1 + photos.length) % photos.length)),
    [photos.length],
  )
  const goNext = useCallback(
    () => setIndex((current) => (current === null ? current : (current + 1) % photos.length)),
    [photos.length],
  )

  return (
    <SectionShell
      id="gallery"
      ornament
      labelledBy="gallery-title"
      className="bg-[linear-gradient(180deg,transparent,rgba(255,253,248,0.75)_35%,transparent)]"
    >
      <SectionHeading
        eyebrow="Our Moments"
        title={weddingConfig.gallery.title}
        subtitle={weddingConfig.gallery.subtitle}
        titleId="gallery-title"
      />

      <div className="mt-10">
        <GalleryGrid photos={photos} onOpen={setIndex} />
      </div>

      {photos.length ? (
        <Reveal delay={0.1} className="mt-8">
          <p className="flex flex-wrap items-center justify-center gap-2 text-center font-serif text-[13px] italic text-cocoa-300">
            <Icon name="maximize" size={14} className="text-champagne-600" />
            Ketuk foto untuk membukanya dalam ukuran besar.
            <span className="hidden sm:inline">Gunakan tombol ← → atau geser untuk berpindah.</span>
          </p>
        </Reveal>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <GalleryLightbox photos={photos} index={index} onClose={close} onPrev={goPrev} onNext={goNext} />
        ) : null}
      </AnimatePresence>
    </SectionShell>
  )
}
