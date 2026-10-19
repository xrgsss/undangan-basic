import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { sectionIds, weddingConfig } from './data/weddingConfig'
import useActiveSection from './hooks/useActiveSection'
import useGuestName from './hooks/useGuestName'
import useMusicPlayer from './hooks/useMusicPlayer'
import useScrollLock from './hooks/useScrollLock'
import { buildStructuredData } from './lib/utils'

import ToastProvider from './components/Toast'
import WeddingCover from './components/WeddingCover'
import DesktopNavigation from './components/DesktopNavigation'
import BottomNavigation from './components/BottomNavigation'
import ScrollProgress from './components/ScrollProgress'
import MusicPlayer from './components/MusicPlayer'
import Footer from './components/Footer'
import GiftSection from './components/GiftSection'

import HomeSection from './sections/HomeSection'
import QuoteSection from './sections/QuoteSection'
import CoupleSection from './sections/CoupleSection'
import EventSection from './sections/EventSection'
import GallerySection from './sections/GallerySection'
import RSVPSection from './sections/RSVPSection'

/* ============================================================================
 *  App — menyusun seluruh bagian undangan.
 *
 *  Alur singkat:
 *   1. Cover tampil memenuhi layar (konten undangan dibuat `inert` agar tidak
 *      bisa difokus keyboard dan tidak terbaca pembaca layar).
 *   2. Tombol "Buka Undangan" memulai musik di dalam gesture pengguna, lalu
 *      menutup cover dengan animasi amplop.
 *   3. Navigasi (desktop & mobile) aktif, scroll-spy menandai section aktif.
 * ========================================================================== */
export default function App() {
  const [coverOpen, setCoverOpen] = useState(true)
  const mainRef = useRef(null)

  const { guestName } = useGuestName()

  const music = useMusicPlayer({
    src: weddingConfig.music.src,
    volume: weddingConfig.music.volume,
  })

  const activeId = useActiveSection(sectionIds, { enabled: !coverOpen })

  // Kunci scroll selama cover masih terbuka.
  useScrollLock(coverOpen)

  // Judul dokumen & data terstruktur (schema.org) untuk mesin pencari.
  useEffect(() => {
    document.title = weddingConfig.meta.title

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(buildStructuredData())
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  /** Dipanggil tepat pada klik "Buka Undangan" — di dalam gesture pengguna. */
  const handleOpenStart = useCallback(() => {
    // Pemutaran boleh gagal (diblokir browser / berkas tidak ada);
    // useMusicPlayer sudah menangani kegagalan tersebut.
    music.play()
  }, [music])

  const handleOpened = useCallback(() => {
    setCoverOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
    // Pindahkan fokus ke konten utama untuk pengguna keyboard / pembaca layar.
    window.setTimeout(() => mainRef.current?.focus({ preventScroll: true }), 120)
  }, [])

  return (
    <ToastProvider>
      {/* Tekstur kertas halus di seluruh halaman (dekoratif, tidak menghalangi klik) */}
      <div className="pointer-events-none fixed inset-0 z-[5] paper-grain" aria-hidden="true" />

      <AnimatePresence>
        {coverOpen ? (
          <WeddingCover
            key="cover"
            guestName={guestName}
            onOpenStart={handleOpenStart}
            onOpened={handleOpened}
          />
        ) : null}
      </AnimatePresence>

      {!coverOpen ? (
        <>
          <ScrollProgress />
          <DesktopNavigation activeId={activeId} />
          <MusicPlayer
            player={music}
            title={weddingConfig.music.title}
            artist={weddingConfig.music.artist}
          />
        </>
      ) : null}

      <main
        ref={mainRef}
        tabIndex={-1}
        inert={coverOpen ? true : undefined}
        className="relative z-[6] pb-below-nav outline-none md:pb-0"
        aria-hidden={coverOpen ? 'true' : undefined}
      >
        <HomeSection guestName={guestName} />
        <QuoteSection />
        <CoupleSection />
        <EventSection />
        <GallerySection />
        <RSVPSection guestName={guestName} />
        {weddingConfig.gift?.enabled ? <GiftSection /> : null}
        <Footer />
      </main>

      {!coverOpen ? <BottomNavigation activeId={activeId} /> : null}
    </ToastProvider>
  )
}
