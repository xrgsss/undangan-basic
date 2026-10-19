import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import { weddingConfig } from '../data/weddingConfig'
import { cn, scrollToSection } from '../lib/utils'

/* ============================================================================
 *  DesktopNavigation — navigasi mengambang untuk layar besar.
 *  Muncul setelah pengguna melewati halaman pembuka, dengan indikator aktif
 *  yang bergeser halus dan tidak mendominasi tampilan.
 * ========================================================================== */
export default function DesktopNavigation({ activeId }) {
  const [visible, setVisible] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 260)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { bride, groom } = weddingConfig.couple

  return (
    <motion.nav
      aria-label="Navigasi bagian undangan"
      className="fixed left-1/2 top-4 z-[60] hidden -translate-x-1/2 lg:block"
      initial={false}
      animate={{ y: visible ? 0 : -70, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-champagne/25 bg-ivory-50/88 px-2.5 py-1.5 shadow-card backdrop-blur-md">
        <span className="mr-1 flex items-center gap-2 pl-1.5 pr-2">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-champagne/45 font-script text-[13px] leading-none text-champagne-700">
            {bride.initials}&amp;{groom.initials}
          </span>
          <span className="h-4 w-px bg-champagne/25" aria-hidden="true" />
        </span>

        {weddingConfig.navigation.map((item) => {
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'relative flex items-center gap-1.5 rounded-full px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-300',
                isActive ? 'text-champagne-700' : 'text-cocoa-400 hover:text-champagne-700',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="desktop-nav-indicator"
                  className="absolute inset-0 rounded-full border border-champagne/35 bg-champagne/12"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                <Icon name={item.icon} size={14} />
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}
