import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* ============================================================================
 *  Monogram — inisial pengantin di dalam lingkaran garis emas.
 *  Garis lingkaran "terbentuk" secara bertahap memakai animasi pathLength.
 * ========================================================================== */
export default function Monogram({
  initials = 'D & H',
  size = 132,
  className = '',
  animate = true,
  dashed = true,
}) {
  const uid = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const shouldAnimate = animate && !reduce

  const draw = shouldAnimate
    ? {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
      }
    : { initial: { pathLength: 1, opacity: 1 } }

  return (
    <div className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        className="absolute inset-0"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={`mono-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6d5b4" />
            <stop offset="42%" stopColor="#b9955b" />
            <stop offset="100%" stopColor="#8f7343" />
          </linearGradient>
        </defs>

        {/* Lingkaran luar */}
        <motion.circle
          cx="80"
          cy="80"
          r="72"
          fill="none"
          stroke={`url(#mono-${uid})`}
          strokeWidth="1.4"
          strokeLinecap="round"
          {...draw}
        />
        {/* Lingkaran dalam (putus-putus, statis) */}
        <circle
          cx="80"
          cy="80"
          r="63"
          fill="none"
          stroke={`url(#mono-${uid})`}
          strokeWidth="0.7"
          strokeDasharray="1.5 6"
          opacity="0.75"
        />
        {/* Permata kecil di empat mata angin */}
        {[0, 90, 180, 270].map((angle) => (
          <rect
            key={angle}
            x="77.6"
            y="4.6"
            width="4.8"
            height="4.8"
            fill={`url(#mono-${uid})`}
            transform={`rotate(${angle} 80 80)`}
          />
        ))}
      </svg>

      <motion.span
        initial={shouldAnimate ? { opacity: 0, scale: 0.82 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: shouldAnimate ? 0.45 : 0 }}
        className="relative z-10 font-script leading-none text-gilded"
        style={{ fontSize: size * 0.3 }}
      >
        {initials}
      </motion.span>
    </div>
  )
}
