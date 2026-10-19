import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { CornerBloom, SoftBlob, PetalField } from './FloralDecoration'
import Monogram from './Monogram'
import Button from './Button'
import Icon from './Icon'
import QrCard from './QrCard'
import { weddingConfig } from '../data/weddingConfig'
import { formatDateLong } from '../lib/utils'

/* ============================================================================
 *  WeddingCover — halaman pembuka undangan.
 *
 *  Alur:
 *   1. Tamu melihat cover (ornamen floral muncul perlahan, inisial scale-up,
 *      nama fade-up, garis lingkaran emas tergambar bertahap).
 *   2. Menekan "Buka Undangan" → animasi amplop (kilau emas + konten mengecil)
 *      → onOpened() dipanggil → App menampilkan undangan utama.
 *   3. Musik dimulai tepat pada klik tersebut (masih dalam gesture pengguna)
 *      lewat callback onOpenStart, sehingga browser mengizinkan pemutaran.
 * ========================================================================== */
export default function WeddingCover({ onOpened, onOpenStart, guestName }) {
  const reduce = useReducedMotion()
  const [opening, setOpening] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const openButtonRef = useRef(null)
  const canParallax = useRef(false)

  // --- Parallax ringan mengikuti gerakan pointer (desktop/mouse) -------------
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 55, damping: 22, mass: 0.6 })
  const springY = useSpring(pointerY, { stiffness: 55, damping: 22, mass: 0.6 })
  const topLeftX = useTransform(springX, (value) => value * -18)
  const topLeftY = useTransform(springY, (value) => value * -14)
  const bottomRightX = useTransform(springX, (value) => value * 18)
  const bottomRightY = useTransform(springY, (value) => value * 14)
  const blobX = useTransform(springX, (value) => value * 26)
  const blobY = useTransform(springY, (value) => value * 20)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    canParallax.current = window.matchMedia('(pointer: fine)').matches && !reduce
  }, [reduce])

  const handlePointerMove = (event) => {
    if (!canParallax.current) return
    const { innerWidth, innerHeight } = window
    pointerX.set((event.clientX / innerWidth - 0.5) * 2)
    pointerY.set((event.clientY / innerHeight - 0.5) * 2)
  }

  // Fokuskan tombol utama saat cover tampil → navigasi keyboard langsung siap.
  useEffect(() => {
    const timer = window.setTimeout(() => openButtonRef.current?.focus({ preventScroll: true }), 700)
    return () => window.clearTimeout(timer)
  }, [])

  const handleOpen = () => {
    if (opening) return
    setOpening(true)
    // Mulai musik di dalam gesture pengguna yang sama.
    onOpenStart?.()
    window.setTimeout(
      () => {
        onOpened?.()
      },
      reduce ? 150 : 820,
    )
  }

  const { bride, groom } = weddingConfig.couple
  const initials = `${bride.initials} & ${groom.initials}`
  const dateLabel = weddingConfig.event.dateLabel || formatDateLong(weddingConfig.event.dateISO)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : weddingConfig.meta.siteUrl

  const contentAnim = opening
    ? { opacity: 0, scale: 0.94, y: reduce ? 0 : -18, filter: 'blur(6px)' }
    : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }

  return (
    <motion.div
      className="fixed inset-0 z-[90] overflow-y-auto overflow-x-hidden no-scrollbar"
      style={{ backgroundColor: weddingConfig.theme.ivory }}
      onPointerMove={handlePointerMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: '-4%', scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label="Halaman pembuka undangan"
    >
      {/* ---------- Latar belakang ---------- */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 95% at 50% -5%, #FFFDF8 0%, #F7F5EF 46%, #EFE9DB 78%, #E5DDCB 100%)',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 paper-grain" aria-hidden="true" />
      <PetalField className="fixed -z-10" />
      <motion.div style={{ x: blobX, y: blobY }} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <SoftBlob className="-left-24 -top-20" color="#7188A5" opacity={0.16} size={480} />
        <SoftBlob className="-bottom-32 -right-24" color="#77785F" opacity={0.14} size={440} />
        <SoftBlob className="left-1/2 top-1/3 -translate-x-1/2" color="#B9955B" opacity={0.1} size={380} />
      </motion.div>

      {/* ---------- Ornamen sudut dengan parallax ---------- */}
      <motion.div style={{ x: topLeftX, y: topLeftY }} className="fixed inset-0 -z-[5] pointer-events-none" aria-hidden="true">
        <div className="h-full w-full origin-top-left scale-[0.68] sm:scale-100">
          <CornerBloom position="top-left" scale={0.9} opacity={0.95} className="-left-6 -top-8 sm:left-0 sm:top-0" />
        </div>
      </motion.div>
      <motion.div
        style={{ x: bottomRightX, y: bottomRightY }}
        className="fixed inset-0 -z-[5] pointer-events-none"
        aria-hidden="true"
      >
        <div className="h-full w-full origin-bottom-right scale-[0.68] sm:scale-100">
          <CornerBloom
            position="bottom-right"
            scale={0.95}
            opacity={0.9}
            tone="blue"
            className="-bottom-10 -right-8 sm:bottom-0 sm:right-0"
          />
        </div>
      </motion.div>

      {/* ---------- Bingkai emas tipis ---------- */}
      <div
        className="pointer-events-none fixed inset-2 rounded-[1.75rem] border border-champagne/25 sm:inset-4 sm:rounded-[2rem]"
        aria-hidden="true"
      />

      {/* ---------- Konten utama ---------- */}
      <motion.div
        className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center sm:px-10"
        animate={contentAnim}
        transition={{ duration: reduce ? 0.2 : 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-champagne-600 sm:text-[11px]"
        >
          {weddingConfig.cover.eyebrow}
        </motion.p>

        {/* Ornamen garis emas di atas monogram */}
        <motion.span
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 h-px w-28 origin-center gold-rule sm:w-36"
          aria-hidden="true"
        />

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <div className="sm:hidden">
            <Monogram initials={initials} size={140} />
          </div>
          <div className="hidden sm:block">
            <Monogram initials={initials} size={168} />
          </div>
        </motion.div>

        {/* Nama pengantin */}
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-script text-[2.75rem] leading-[1.15] text-gilded sm:text-6xl"
        >
          {bride.nickname} <span className="mx-1 inline-block text-champagne">&amp;</span> {groom.nickname}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex items-center gap-3"
        >
          <span className="h-px w-8 gold-rule" aria-hidden="true" />
          <p className="font-display text-sm tracking-[0.18em] text-cocoa-400 sm:text-base">{dateLabel}</p>
          <span className="h-px w-8 gold-rule" aria-hidden="true" />
        </motion.div>

        {/* Kartu tamu */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="paper-card mt-9 w-full max-w-sm rounded-2xl px-5 py-5"
        >
          <p className="font-sans text-[9px] font-bold uppercase tracking-[0.28em] text-cocoa-300">
            {weddingConfig.cover.inviteToLabel}
          </p>
          <p className="mt-2 break-words font-display text-xl text-cocoa sm:text-2xl">{guestName}</p>
          <span className="mx-auto mt-4 block h-px w-16 gold-rule" aria-hidden="true" />
        </motion.div>

        {/* Tombol buka undangan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex w-full max-w-sm flex-col items-center gap-3"
        >
          <Button
            ref={openButtonRef}
            size="lg"
            shine="always"
            icon="mail"
            fullWidth
            onClick={handleOpen}
            disabled={opening}
            aria-label={`Buka undangan pernikahan ${bride.nickname} dan ${groom.nickname}`}
          >
            {opening ? 'Membuka…' : weddingConfig.cover.openButtonLabel}
          </Button>

          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-cocoa-300">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="music" size={13} className="text-champagne-600" />
              Musik latar
            </span>
            <span className="h-3 w-px bg-champagne/30" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 transition-colors hover:text-champagne-700"
            >
              <Icon name="qr" size={13} className="text-champagne-600" />
              QR Undangan
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.5 }}
          className="mt-8 max-w-xs font-serif text-[11px] italic leading-relaxed text-cocoa-300 sm:text-xs"
        >
          {weddingConfig.cover.hint}
        </motion.p>
      </motion.div>

      {/* ---------- Kilau emas saat amplop dibuka ---------- */}
      <AnimatePresence>
        {opening ? (
          <motion.div
            key="burst"
            className="pointer-events-none fixed inset-0 z-[2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            <motion.div
              className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,253,248,0.96) 0%, rgba(214,189,147,0.55) 38%, rgba(185,149,91,0.12) 66%, transparent 78%)',
              }}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0.2 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ---------- Modal QR ---------- */}
      <AnimatePresence>
        {showQr ? (
          <motion.div
            key="qr-modal"
            className="fixed inset-0 z-[95] grid place-items-center bg-cocoa/45 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={() => setShowQr(false)}
            role="dialog"
            aria-modal="true"
            aria-label="QR code undangan"
          >
            <motion.div
              className="paper-card w-full max-w-xs rounded-3xl p-6"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-champagne-600">
                    Bagikan Undangan
                  </p>
                  <p className="mt-1 font-display text-base text-cocoa">Pindai QR code ini</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="rounded-full p-1.5 text-cocoa-300 transition-colors hover:bg-champagne/10 hover:text-cocoa"
                  aria-label="Tutup QR code"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
              <QrCard
                url={shareUrl}
                size={168}
                className="mt-5"
                caption="Arahkan kamera ponsel untuk membuka undangan ini."
              />
              <p className="mt-4 truncate text-center font-mono text-[10px] text-cocoa-300" title={shareUrl}>
                {shareUrl}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
