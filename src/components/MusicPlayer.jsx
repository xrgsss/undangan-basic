import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import { cn } from '../lib/utils'
import { useToast } from './Toast'

/* ============================================================================
 *  MusicPlayer — tombol musik latar.
 *
 *  Komponen ini TIDAK membuat instance audio sendiri (lihat useMusicPlayer di
 *  App.jsx) supaya hanya ada satu elemen audio di seluruh aplikasi.
 *  Semua pemutaran diawali oleh interaksi pengguna.
 * ========================================================================== */
export default function MusicPlayer({ player, title, artist, className }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const reduce = useReducedMotion()
  const { showToast } = useToast()

  const { isPlaying, isLoading, hasError, error, volume, isMuted, toggle, setVolume, toggleMute } = player

  // Tutup panel saat klik di luar atau tombol Escape ditekan.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleMainButton = async () => {
    const started = await toggle()
    if (!started && hasError && error) {
      showToast(error, { tone: 'error', icon: 'volumeOff' })
    }
  }

  const statusLabel = hasError
    ? 'Musik tidak tersedia'
    : isPlaying
      ? 'Jeda musik'
      : isLoading
        ? 'Memuat musik'
        : 'Putar musik'

  return (
    <div ref={containerRef} className={cn('fixed right-3 z-[70] safe-top sm:right-5', className)}>
      <div className="relative flex flex-col items-end gap-2">
        <motion.button
          type="button"
          onClick={handleMainButton}
          onContextMenu={(event) => {
            event.preventDefault()
            setOpen((value) => !value)
          }}
          aria-label={statusLabel}
          aria-expanded={open}
          aria-pressed={isPlaying}
          title={statusLabel}
          className={cn(
            'group relative grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition-colors duration-300',
            'border-champagne/45 bg-ivory-50/85 text-champagne-700 shadow-soft hover:bg-white',
            hasError && 'border-cocoa-300/50 text-cocoa-400',
          )}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          whileHover={reduce ? undefined : { scale: 1.05 }}
        >
          {/* cincin berputar saat musik aktif */}
          {isPlaying && !reduce ? (
            <span
              className="pointer-events-none absolute -inset-[3px] animate-spin-slow rounded-full border border-dashed border-champagne/55"
              aria-hidden="true"
            />
          ) : null}

          {isLoading ? (
            <Icon name="loader" size={18} className="animate-spin" />
          ) : hasError ? (
            <Icon name="volumeOff" size={18} />
          ) : isPlaying ? (
            <Icon name="pause" size={18} />
          ) : (
            <Icon name="music" size={18} />
          )}

          {/* indikator aktif */}
          {isPlaying && !reduce ? (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-soft rounded-full border border-ivory bg-champagne" aria-hidden="true" />
          ) : null}
        </motion.button>

        {/* Tombol kecil untuk membuka pengaturan musik */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-champagne/30 bg-ivory-50/80 px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.18em] text-champagne-700 shadow-soft backdrop-blur transition-colors hover:bg-white"
          aria-label="Pengaturan musik"
        >
          {isPlaying ? 'Musik On' : 'Musik Off'}
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="paper-card w-60 rounded-2xl p-4"
              role="dialog"
              aria-label="Pengaturan musik latar"
            >
              <p className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-champagne-600">
                Musik Latar
              </p>
              <p className="mt-1.5 truncate font-display text-sm text-cocoa" title={title}>
                {title || 'Tanpa judul'}
              </p>
              {artist ? <p className="truncate font-serif text-xs italic text-cocoa-400">{artist}</p> : null}

              {hasError ? (
                <p className="mt-3 rounded-xl border border-[#b3766a]/30 bg-[#fdf5f2] px-3 py-2 text-[11px] leading-relaxed text-[#a95c4d]">
                  {error}
                </p>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-champagne/35 text-champagne-700 transition-colors hover:bg-champagne/10"
                      aria-label={isMuted ? 'Aktifkan suara' : 'Bisukan suara'}
                      aria-pressed={isMuted}
                    >
                      <Icon name={isMuted || volume === 0 ? 'volumeOff' : 'volume'} size={15} />
                    </button>
                    <label className="sr-only" htmlFor="music-volume">
                      Volume musik
                    </label>
                    <input
                      id="music-volume"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(event) => setVolume(event.target.value)}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-champagne/25 [accent-color:#B9955B]"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-cocoa-300">
                    Volume: {Math.round((isMuted ? 0 : volume) * 100)}%
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={handleMainButton}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-champagne/45 bg-white/70 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-700 transition-colors hover:bg-white"
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={14} />
                {isPlaying ? 'Jeda' : 'Putar'}
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
