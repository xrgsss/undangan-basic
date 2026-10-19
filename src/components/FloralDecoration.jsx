import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/* ============================================================================
 *  FloralDecoration — seluruh ornamen bunga dibuat sebagai SVG vektor lokal.
 *  Tidak ada permintaan gambar ke server pihak ketiga, tajam di semua DPI,
 *  dan ukurannya sangat kecil sehingga tetap ringan di ponsel.
 *
 *  Komponen yang diekspor:
 *   • Rose              — mawar (biru dusty / champagne)
 *   • LeafSpray         — tangkai daun zaitun
 *   • GoldFlourish      — garis emas melengkung
 *   • CornerBloom       — komposisi bunga untuk sudut halaman
 *   • SectionOrnament   — ornamen kecil di atas/bawah judul
 *   • Divider           — pembatas antar-section
 *   • PetalField        — kelopak melayang di latar belakang
 *   • SoftBlob          — gradasi watercolor lembut
 * ========================================================================== */

/** Path satu kelopak mawar (sumbu vertikal, tinggi 2r). */
const petalPath = (r) =>
  `M0,${-r} C${(r * 0.55).toFixed(2)},${-r} ${(r * 0.98).toFixed(2)},${(-r * 0.62).toFixed(2)} ${(
    r * 0.98
  ).toFixed(2)},${(-r * 0.05).toFixed(2)} C${(r * 0.98).toFixed(2)},${(r * 0.6).toFixed(2)} ${(
    r * 0.52
  ).toFixed(2)},${r} 0,${r} C${(-r * 0.52).toFixed(2)},${r} ${(-r * 0.98).toFixed(
    2,
  )},${(r * 0.6).toFixed(2)} ${(-r * 0.98).toFixed(2)},${(-r * 0.05).toFixed(2)} C${(-r * 0.98).toFixed(
    2,
  )},${(-r * 0.62).toFixed(2)} ${(-r * 0.55).toFixed(2)},${-r} 0,${-r} Z`

const PALETTE = {
  blue: {
    outer: '#a9b9cc',
    mid: '#8098b4',
    inner: '#607a9a',
    core: '#4a6183',
    line: '#3d5170',
  },
  champagne: {
    outer: '#e6d5b4',
    mid: '#d2b787',
    inner: '#bb9a5f',
    core: '#9a7a46',
    line: '#7c6137',
  },
  ivory: {
    outer: '#efe9db',
    mid: '#ded4c0',
    inner: '#c9bca1',
    core: '#b0a086',
    line: '#96876e',
  },
}

/* -------------------------------------------------------------------------- */
/*  Rose                                                                      */
/* -------------------------------------------------------------------------- */
export function Rose({ size = 120, tone = 'blue', opacity = 1, className = '', rotate = 0, style }) {
  const uid = useId().replace(/:/g, '')
  const c = PALETTE[tone] ?? PALETTE.blue

  const layers = [
    { r: 42, count: 5, offset: 0, fill: c.outer, fillOpacity: 0.55 },
    { r: 31, count: 5, offset: 36, fill: c.mid, fillOpacity: 0.62 },
    { r: 20, count: 5, offset: 72, fill: c.inner, fillOpacity: 0.72 },
    { r: 11, count: 4, offset: 18, fill: c.core, fillOpacity: 0.8 },
  ]

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ opacity, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`rbg-${uid}`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="55%" stopColor={c.outer} stopOpacity="0.28" />
          <stop offset="100%" stopColor={c.mid} stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id={`rcore-${uid}`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor={c.core} stopOpacity="0.9" />
        </radialGradient>
        <filter id={`rsoft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>

      {/* aura watercolor */}
      <circle cx="60" cy="60" r="56" fill={`url(#rbg-${uid})`} />

      <g transform="translate(60 60)">
        {layers.map((layer, layerIndex) => (
          <g key={layerIndex} filter={`url(#rsoft-${uid})`}>
            {Array.from({ length: layer.count }).map((_, index) => (
              <path
                key={index}
                d={petalPath(layer.r)}
                fill={layer.fill}
                fillOpacity={layer.fillOpacity}
                transform={`rotate(${layer.offset + (360 / layer.count) * index})`}
                stroke={c.line}
                strokeOpacity="0.16"
                strokeWidth="0.6"
              />
            ))}
          </g>
        ))}

        {/* inti mawar: spiral lembut */}
        <circle r="7" fill={`url(#rcore-${uid})`} />
        <path
          d="M0,-6 C4,-6 6,-3 6,0 C6,4 3,6 0,6 C-4,6 -6,3 -6,0 C-6,-3 -3,-5 0,-5 C3,-5 5,-3 5,-1"
          fill="none"
          stroke={c.line}
          strokeOpacity="0.45"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Daun zaitun                                                               */
/* -------------------------------------------------------------------------- */
function Leaf({ length = 62, width = 20, fill = '#77785f', vein = '#5c5d47', opacity = 1 }) {
  const d = `M0,0 C${length * 0.3},${-width} ${length * 0.72},${-width * 0.95} ${length},0 C${length * 0.72},${
    width * 0.95
  } ${length * 0.3},${width} 0,0 Z`
  const midrib = `M2,0 C${length * 0.34},${-width * 0.18} ${length * 0.68},${-width * 0.1} ${length * 0.94},0`
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} fillOpacity="0.9" />
      <path d={d} fill="#ffffff" fillOpacity="0.07" />
      <path d={midrib} fill="none" stroke={vein} strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  )
}

/** Tangkai berisi beberapa daun, arah tumbuh ke kanan dari titik (0,0). */
export function LeafSpray({ size = 140, className = '', opacity = 1, leaves = 3, rotate = 0, flip = false, style }) {
  const configs = [
    { rotate: -34, length: 66, width: 19, scale: 1 },
    { rotate: 4, length: 78, width: 21, scale: 1 },
    { rotate: 40, length: 62, width: 18, scale: 1 },
    { rotate: -66, length: 46, width: 14, scale: 1 },
  ].slice(0, Math.max(2, Math.min(leaves, 4)))

  return (
    <svg
      viewBox="-10 -90 190 180"
      width={size}
      height={size}
      className={className}
      style={{ opacity, transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`, ...style }}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0,0 C34,-4 62,-10 104,-6"
        fill="none"
        stroke="#77785f"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {configs.map((leaf, index) => (
        <g
          key={index}
          transform={`translate(${10 + index * 22} ${index % 2 === 0 ? -2 : 2}) rotate(${leaf.rotate})`}
        >
          <Leaf length={leaf.length} width={leaf.width} />
        </g>
      ))}
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Garis emas melengkung                                                     */
/* -------------------------------------------------------------------------- */
export function GoldFlourish({ width = 240, className = '', opacity = 1, flip = false, rotate = 0, style }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 280 150"
      width={width}
      height={(width * 150) / 280}
      className={className}
      style={{ opacity, transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`, ...style }}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6bd93" />
          <stop offset="45%" stopColor="#b9955b" />
          <stop offset="100%" stopColor="#8f7343" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#gold-${uid})`} strokeLinecap="round">
        {/* lengkung utama */}
        <path d="M6,132 C58,132 92,96 132,74 C176,50 214,46 272,20" strokeWidth="1.6" />
        {/* lengkung pendamping */}
        <path d="M18,142 C70,140 104,110 146,90 C186,70 226,66 268,44" strokeWidth="0.9" opacity="0.7" />
        {/* daun kecil di sepanjang garis */}
        <path d="M74,116 C88,104 100,102 112,100 C104,112 90,120 74,116 Z" fill={`url(#gold-${uid})`} opacity="0.75" stroke="none" />
        <path d="M168,60 C182,50 194,48 206,46 C198,58 184,66 168,60 Z" fill={`url(#gold-${uid})`} opacity="0.6" stroke="none" />
        {/* titik-titik ornamen */}
        <circle cx="216" cy="52" r="2.4" fill={`url(#gold-${uid})`} stroke="none" />
        <circle cx="236" cy="40" r="1.6" fill={`url(#gold-${uid})`} stroke="none" />
        {/* ujung bergulir */}
        <path d="M272,20 C266,12 256,12 252,18 C248,24 254,30 260,27" strokeWidth="1.1" />
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  CornerBloom — ornamen sudut halaman                                       */
/* -------------------------------------------------------------------------- */
const CORNER_TRANSFORM = {
  'top-left': 'none',
  'top-right': 'scaleX(-1)',
  'bottom-left': 'scaleY(-1)',
  'bottom-right': 'scale(-1, -1)',
}

export function CornerBloom({ position = 'top-left', scale = 1, className = '', opacity = 1, tone = 'blue', float = true }) {
  const reduce = useReducedMotion()
  const animated = float && !reduce

  const wrapperProps = animated
    ? {
        animate: { y: [0, -10, 0] },
        transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  return (
    <div
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        width: 320 * scale,
        height: 320 * scale,
        transform: CORNER_TRANSFORM[position],
        opacity,
      }}
      aria-hidden="true"
    >
      <motion.div className="relative h-full w-full" {...wrapperProps}>
        {/* garis emas mengikuti sudut */}
        <GoldFlourish width={196 * scale} className="absolute left-[112px] top-[118px] opacity-80" />
        {/* dedaunan */}
        <LeafSpray
          size={168 * scale}
          className="absolute left-[110px] top-[104px]"
          rotate={-16}
          opacity={0.9}
        />
        <LeafSpray
          size={132 * scale}
          className="absolute left-[86px] top-[150px]"
          rotate={38}
          opacity={0.75}
        />
        {/* mawar utama */}
        <Rose size={132 * scale} tone={tone} className="absolute left-0 top-0 drop-shadow-[0_6px_14px_rgba(113,136,165,0.22)]" />
        {/* mawar kecil pendamping */}
        <Rose size={54 * scale} tone={tone} opacity={0.85} rotate={22} className="absolute left-[104px] top-[76px]" />
        <Rose size={36 * scale} tone={tone} opacity={0.7} rotate={-14} className="absolute left-[52px] top-[128px]" />
      </motion.div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SectionOrnament — ornamen kecil penyerta judul                            */
/* -------------------------------------------------------------------------- */
export function SectionOrnament({ className = '', width = 220, tone = 'blue' }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`mx-auto flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="h-px w-10 gold-rule sm:w-16" />
      <LeafSpray size={54} rotate={168} opacity={0.75} leaves={2} />
      <Rose size={34} tone={tone} rotate={12} />
      <LeafSpray size={54} rotate={192} opacity={0.75} leaves={2} flip />
      <span className="h-px w-10 gold-rule sm:w-16" />
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Divider — pembatas antar-section                                          */
/* -------------------------------------------------------------------------- */
export function Divider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 max-w-[30%] gold-rule opacity-70" />
      <span className="flex items-center gap-2">
        <span className="h-1 w-1 rotate-45 bg-champagne/70" />
        <Rose size={22} tone="champagne" opacity={0.9} />
        <span className="h-1 w-1 rotate-45 bg-champagne/70" />
      </span>
      <span className="h-px flex-1 max-w-[30%] gold-rule opacity-70" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  PetalField — kelopak melayang (latar belakang)                            */
/* -------------------------------------------------------------------------- */
const PETALS = [
  { left: '6%', delay: '0s', duration: '17s', size: 14, tone: '#a9b9cc' },
  { left: '18%', delay: '4s', duration: '22s', size: 10, tone: '#d6bd93' },
  { left: '31%', delay: '9s', duration: '19s', size: 16, tone: '#8098b4' },
  { left: '44%', delayed: true, delay: '2s', duration: '24s', size: 11, tone: '#a8a893' },
  { left: '57%', delay: '11s', duration: '20s', size: 13, tone: '#a9b9cc' },
  { left: '69%', delay: '6s', duration: '23s', size: 9, tone: '#d6bd93' },
  { left: '82%', delay: '14s', duration: '18s', size: 15, tone: '#8098b4' },
  { left: '93%', delay: '8s', duration: '21s', size: 12, tone: '#a8a893' },
]

export function PetalField({ className = '' }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="absolute top-0 block animate-petal rounded-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size * 1.5,
            backgroundColor: petal.tone,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            opacity: 0.5,
            filter: 'blur(0.3px)',
          }}
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  SoftBlob — sapuan watercolor                                              */
/* -------------------------------------------------------------------------- */
export function SoftBlob({ className = '', color = '#7188A5', opacity = 0.18, size = 420, style }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 40% 40%, ${color} 0%, transparent 68%)`,
        opacity,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export default {
  Rose,
  LeafSpray,
  GoldFlourish,
  CornerBloom,
  SectionOrnament,
  Divider,
  PetalField,
  SoftBlob,
}
