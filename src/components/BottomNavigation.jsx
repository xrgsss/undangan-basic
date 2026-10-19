import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import { weddingConfig } from '../data/weddingConfig'
import { cn, copyText, scrollToSection } from '../lib/utils'
import { useToast } from './Toast'

/* ============================================================================
 *  BottomNavigation — navigasi utama pada perangkat mobile.
 *  • 5 menu utama + tombol "Lainnya" (bottom sheet berisi seluruh menu).
 *  • Indikator menu aktif bergeser halus (framer-motion layoutId).
 *  • Padding memperhatikan safe area iOS (home indicator).
 *  • Tidak menutupi konten: konten utama diberi padding bawah (pb-below-nav).
 * ========================================================================== */
export default function BottomNavigation({ activeId }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const reduce = useReducedMotion()
  const { showToast } = useToast()

  const items = weddingConfig.navigation
  const primaryIds = weddingConfig.primaryNavIds ?? items.slice(0, 5).map((item) => item.id)
  const primary = primaryIds.map((id) => items.find((item) => item.id === id)).filter(Boolean)
  const secondary = items.filter((item) => !primaryIds.includes(item.id))
  const activeIsSecondary = secondary.some((item) => item.id === activeId)

  useEffect(() => {
    if (!sheetOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sheetOpen])

  const handleNavigate = (id) => {
    setSheetOpen(false)
    // Beri jeda singkat agar sheet menutup dulu, lalu scroll.
    window.setTimeout(() => scrollToSection(id), 120)
  }

  const handleCopyLink = async () => {
    const ok = await copyText(window.location.href)
    showToast(ok ? 'Tautan undangan berhasil disalin.' : 'Gagal menyalin tautan.', {
      tone: ok ? 'success' : 'error',
      icon: ok ? 'check' : 'error',
    })
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-[60] md:hidden" aria-label="Navigasi undangan">
        <div className="mx-auto w-full max-w-lg px-3 safe-bottom">
          <div className="relative flex items-stretch justify-between gap-0.5 rounded-[1.35rem] border border-champagne/25 bg-ivory-50/92 p-1.5 shadow-[0_-8px_30px_-18px_rgba(91,80,68,0.45)] backdrop-blur-md">
            {primary.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onClick={() => handleNavigate(item.id)}
                reduce={reduce}
                layoutId="bottom-nav-indicator"
              />
            ))}

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={cn(
                'relative flex min-h-[52px] min-w-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors duration-300',
                activeIsSecondary ? 'text-champagne-700' : 'text-cocoa-300 hover:text-champagne-700',
              )}
              aria-label="Menu lainnya"
              aria-expanded={sheetOpen}
              aria-haspopup="dialog"
            >
              <span className="relative grid h-6 w-6 place-items-center">
                <Icon name="dots" size={20} />
              </span>
              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.08em]">Lainnya</span>
              {activeIsSecondary ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
              ) : null}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {sheetOpen ? (
          <motion.div
            className="fixed inset-0 z-[65] flex items-end justify-center bg-cocoa/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            onClick={() => setSheetOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Menu lainnya"
          >
            <motion.div
              className="w-full max-w-lg rounded-t-3xl border-t border-champagne/30 bg-ivory-50 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-4 shadow-[0_-20px_50px_-20px_rgba(91,80,68,0.5)]"
              initial={reduce ? { opacity: 0 } : { y: '100%' }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-champagne/35" aria-hidden="true" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-champagne-600">
                    Menu Undangan
                  </p>
                  <p className="mt-1 font-display text-lg text-cocoa">Pilih bagian yang ingin dibuka</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="rounded-full p-2 text-cocoa-300 transition-colors hover:bg-champagne/10 hover:text-cocoa"
                  aria-label="Tutup menu"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      'flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 transition-colors duration-300',
                      activeId === item.id
                        ? 'border-champagne/55 bg-champagne/12 text-champagne-700'
                        : 'border-champagne/20 bg-white/60 text-cocoa-400 hover:border-champagne/40 hover:text-champagne-700',
                    )}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className="text-center font-sans text-[10px] font-bold uppercase tracking-[0.1em]">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-champagne/40 bg-white/70 py-3 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-champagne-700 transition-colors hover:bg-white"
              >
                <Icon name="share" size={15} />
                Salin Tautan Undangan
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function NavItem({ item, isActive, onClick, reduce, layoutId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      aria-label={`Buka bagian ${item.label}`}
      className={cn(
        'relative flex min-h-[52px] min-w-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors duration-300',
        isActive ? 'text-champagne-700' : 'text-cocoa-300 hover:text-champagne-700',
      )}
    >
      {isActive ? (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-2xl border border-champagne/35 bg-champagne/12"
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
          aria-hidden="true"
        />
      ) : null}
      <span className="relative grid h-6 w-6 place-items-center">
        <Icon name={item.icon} size={19} />
      </span>
      <span className="relative font-sans text-[9px] font-bold uppercase tracking-[0.06em]">{item.label}</span>
    </button>
  )
}
