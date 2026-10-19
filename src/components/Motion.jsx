import { motion, useReducedMotion } from 'framer-motion'

/* ============================================================================
 *  Motion helpers — pembungkus animasi yang konsisten & menghormati
 *  `prefers-reduced-motion`. Semua animasi memakai easing yang lembut
 *  (easeOutQuint) dengan durasi 0.3–0.8 detik.
 * ========================================================================== */

export const EASE = [0.22, 1, 0.36, 1] // easeOutQuint
export const EASE_SOFT = [0.4, 0, 0.2, 1]

/** Animasi reveal saat elemen masuk viewport (sekali saja). */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  scale = 1,
  duration = 0.7,
  once = true,
  amount = 0.25,
  as = 'div',
  className,
  ...rest
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div

  return (
    <MotionTag
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration: reduce ? 0.3 : duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Wadah untuk animasi berurutan (stagger) pada daftar/card. */
export function Stagger({ children, className, delayChildren = 0, stagger = 0.12, amount = 0.15, ...rest }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren } },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Anak dari <Stagger>. */
export function StaggerItem({ children, y = 26, className, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div
  return (
    <MotionTag
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.3 : 0.65, ease: EASE } },
      }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Pembungkus hover/tap yang aman untuk sentuhan (dipakai tombol & kartu). */
export function Press({ children, className, scale = 0.97, lift = 0, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div
  return (
    <MotionTag
      whileHover={reduce ? undefined : { scale: 1 + lift, y: lift ? -3 : 0 }}
      whileTap={reduce ? undefined : { scale }}
      transition={{ duration: 0.25, ease: EASE_SOFT }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export { motion, useReducedMotion }
