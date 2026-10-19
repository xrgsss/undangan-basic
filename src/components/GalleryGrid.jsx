import { motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import { EASE } from './Motion'

/* ============================================================================
 *  GalleryGrid — galeri masonry (CSS multi-column) yang ringan.
 *  • Setiap foto beda rasio (tidak ada gambar yang berulang).
 *  • Lebar/tinggi intrinsik ditulis agar tidak terjadi layout shift (CLS).
 *  • Lazy loading + decoding async untuk menghemat data pengguna.
 * ========================================================================== */

export const RATIO_DIMENSIONS = {
  portrait: { width: 900, height: 1200 },
  landscape: { width: 1200, height: 900 },
  square: { width: 1000, height: 1000 },
}

export function getPhotoDimensions(ratio) {
  return RATIO_DIMENSIONS[ratio] ?? RATIO_DIMENSIONS.square
}

export default function GalleryGrid({ photos = [], onOpen }) {
  const reduce = useReducedMotion()

  if (!photos.length) {
    return (
      <div className="paper-card rounded-3xl px-6 py-10 text-center">
        <Icon name="image" size={26} className="mx-auto text-champagne-600" />
        <p className="mt-3 text-sm text-cocoa-400">
          Foto galeri belum ditambahkan. Tambahkan pada <code className="font-mono text-xs">weddingConfig.js</code> bagian
          <span className="font-mono text-xs"> gallery.photos</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
      {photos.map((photo, index) => {
        const dimensions = getPhotoDimensions(photo.ratio)
        return (
          <motion.button
            key={`${photo.src}-${index}`}
            type="button"
            onClick={() => onOpen?.(index)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl border border-champagne/20 bg-ivory-100 shadow-soft transition-shadow duration-500 hover:shadow-card sm:mb-4 sm:rounded-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.6, delay: (index % 3) * 0.07, ease: EASE }}
            whileTap={reduce ? undefined : { scale: 0.985 }}
            aria-label={`Perbesar foto ${index + 1}: ${photo.caption || photo.alt || 'foto prewedding'}`}
          >
            <img
              src={photo.src}
              alt={photo.alt || `Foto prewedding ${index + 1}`}
              width={dimensions.width}
              height={dimensions.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
            />

            {/* Lapisan keterangan saat hover */}
            <span
              className="pointer-events-none absolute inset-0 flex items-end bg-[linear-gradient(180deg,transparent_45%,rgba(91,80,68,0.62)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            >
              <span className="w-full p-3 text-left">
                <span className="block font-serif text-[13px] italic leading-snug text-ivory-50">
                  {photo.caption}
                </span>
              </span>
            </span>

            {/* Ikon zoom */}
            <span
              className="pointer-events-none absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-white/40 bg-white/25 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            >
              <Icon name="maximize" size={14} />
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
