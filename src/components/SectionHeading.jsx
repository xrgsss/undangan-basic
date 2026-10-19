import { SectionOrnament } from './FloralDecoration'
import { Reveal } from './Motion'
import { cn } from '../lib/utils'

/* ============================================================================
 *  SectionHeading — judul section dengan eyebrow, ornamen floral, dan garis.
 * ========================================================================== */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  ornament = true,
  className,
  titleAs: TitleTag = 'h2',
  titleId,
  tone = 'blue',
}) {
  const centered = align === 'center'
  return (
    <div className={cn(centered ? 'text-center' : 'text-left', className)}>
      {eyebrow ? (
        <Reveal y={14} duration={0.55}>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.42em] text-champagne-600 sm:text-[11px]">
            {eyebrow}
          </p>
        </Reveal>
      ) : null}

      {ornament ? (
        <Reveal y={14} delay={0.06} duration={0.6} className={cn('mt-4', centered ? '' : 'ml-0 mr-auto')}>
          <SectionOrnament className={centered ? '' : 'justify-start'} tone={tone} />
        </Reveal>
      ) : null}

      <Reveal y={20} delay={0.12}>
        <TitleTag id={titleId} className="mt-4 font-display text-3xl leading-tight text-cocoa sm:text-4xl lg:text-[2.65rem]">
          {title}
        </TitleTag>
      </Reveal>

      {subtitle ? (
        <Reveal y={18} delay={0.18}>
          <p
            className={cn(
              'mt-3 font-serif text-base italic text-cocoa-400 sm:text-lg',
              centered ? 'mx-auto max-w-xl' : 'max-w-xl',
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}
