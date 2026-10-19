import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import { cn } from '../lib/utils'
import { EASE_SOFT } from './Motion'

/* ============================================================================
 *  Button — tombol/tautan seragam untuk seluruh undangan.
 *  • Ukuran minimum 44px agar nyaman disentuh di ponsel.
 *  • Efek kilau (shine) halus pada tombol emas.
 *  • Mendukung state loading, ikon kiri/kanan, dan render sebagai <a>.
 * ========================================================================== */

const VARIANTS = {
  gold: [
    'text-ivory-50 border border-champagne-600/60',
    'bg-[linear-gradient(180deg,#c9a972_0%,#b9955b_52%,#9a7a46_100%)]',
    'shadow-[0_10px_24px_-12px_rgba(185,149,91,0.85)]',
    'hover:bg-[linear-gradient(180deg,#d6bd93_0%,#c2a068_52%,#a8843f_100%)]',
  ].join(' '),
  outline: 'border border-champagne/45 bg-white/70 text-champagne-700 hover:bg-white hover:border-champagne/70 shadow-soft',
  ivory: 'border border-champagne/25 bg-ivory-50 text-cocoa hover:bg-white shadow-soft',
  ghost: 'text-cocoa-400 hover:text-champagne-700 hover:bg-champagne/10',
  dusty: 'border border-dusty-700/40 bg-dusty text-ivory-50 hover:bg-dusty-600 shadow-soft',
}

const SIZES = {
  sm: 'h-10 px-3.5 text-[10px] gap-1.5',
  md: 'h-11 px-5 text-[11px] gap-2',
  lg: 'h-12 px-7 text-xs gap-2.5 sm:h-[3.25rem] sm:px-9 sm:text-[13px]',
}

function ShineLayer({ always }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      <span
        className={cn(
          'absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]',
          always ? 'animate-shimmer' : 'opacity-0 group-hover:opacity-100 group-hover:animate-shimmer',
        )}
      />
    </span>
  )
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'gold',
    size = 'md',
    href,
    type = 'button',
    icon,
    iconRight,
    loading = false,
    shine,
    fullWidth = false,
    disabled = false,
    className,
    onClick,
    as: _as, // tidak dipakai: tag ditentukan otomatis dari ada/tidaknya `href`
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion()
  const isDisabled = disabled || loading
  const showShine = shine ?? variant === 'gold'
  const isLink = Boolean(href) && !isDisabled
  const Tag = isLink ? motion.a : motion.button
  const tagProps = isLink ? { href } : { type, disabled: isDisabled }

  return (
    <Tag
      ref={ref}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...tagProps}
      {...rest}
      className={cn(
        'group relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-sans font-bold uppercase tracking-[0.16em] transition-colors duration-300 ease-out',
        SIZES[size] ?? SIZES.md,
        VARIANTS[variant] ?? VARIANTS.gold,
        fullWidth && 'w-full',
        isDisabled && 'cursor-not-allowed opacity-60',
        className,
      )}
      whileHover={reduce || isDisabled ? undefined : { scale: 1.03 }}
      whileTap={reduce || isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.22, ease: EASE_SOFT }}
    >
      {showShine && !isDisabled ? <ShineLayer always={shine === 'always'} /> : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading ? (
          <Icon name="loader" size="1.1em" className="animate-spin" />
        ) : icon ? (
          <Icon name={icon} size="1.05em" />
        ) : null}
        <span>{children}</span>
        {iconRight ? <Icon name={iconRight} size="1.05em" /> : null}
      </span>
    </Tag>
  )
})

export default Button
