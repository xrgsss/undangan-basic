import { motion, useScroll, useSpring } from 'framer-motion'

/* ============================================================================
 *  ScrollProgress — garis emas tipis di atas layar sebagai penanda posisi baca.
 *  Memakai transform scaleX sehingga tidak memicu layout shift.
 * ========================================================================== */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[75] h-[2px] origin-left bg-[linear-gradient(90deg,#d6bd93,#b9955b,#8f7343)]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}
