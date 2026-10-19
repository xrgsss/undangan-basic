import { CornerBloom } from './FloralDecoration'
import { cn } from '../lib/utils'

/* ============================================================================
 *  SectionShell — kerangka section undangan.
 *  Menjaga jarak antar-section, lebar maksimum konten, offset scroll untuk
 *  navigasi (`scroll-mt`), dan ornamen sudut opsional.
 * ========================================================================== */
export default function SectionShell({
  id,
  children,
  className,
  innerClassName,
  spacing = 'py-16 sm:py-20 lg:py-24',
  ornament = false,
  ornamentPosition = 'top-right',
  labelledBy,
  tone = 'blue',
}) {
  return (
    <section
      id={id}
      className={cn('relative isolate overflow-hidden px-5 sm:px-8 scroll-mt-20 sm:scroll-mt-24', spacing, className)}
      aria-labelledby={labelledBy}
    >
      {ornament ? (
        <CornerBloom
          position={ornamentPosition}
          scale={0.55}
          tone={tone}
          opacity={0.32}
          float={false}
          className={
            ornamentPosition === 'top-right'
              ? '-right-16 -top-10 sm:-right-10 sm:-top-6'
              : '-left-16 -top-10 sm:-left-10 sm:-top-6'
          }
        />
      ) : null}

      <div className={cn('relative mx-auto w-full max-w-5xl', innerClassName)}>{children}</div>
    </section>
  )
}
