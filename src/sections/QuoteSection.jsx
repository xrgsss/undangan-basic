import { motion, useReducedMotion } from 'framer-motion'
import { weddingConfig } from '../data/weddingConfig'
import SectionShell from '../components/SectionShell'
import SectionHeading from '../components/SectionHeading'
import { Divider, Rose } from '../components/FloralDecoration'
import Icon from '../components/Icon'
import { Reveal, Stagger, StaggerItem } from '../components/Motion'

/* ============================================================================
 *  QuoteSection — kutipan & ayat pernikahan.
 *  Semua teks berasal dari weddingConfig.quote sehingga bebas diganti.
 *  Setiap baris kutipan muncul dengan animasi berurutan (stagger).
 * ========================================================================== */
export default function QuoteSection() {
  const { quote } = weddingConfig
  const reduce = useReducedMotion()

  return (
    <SectionShell id="quote" ornament labelledBy="quote-title" className="bg-[linear-gradient(180deg,rgba(255,253,248,0.6),transparent_45%)]">
      <SectionHeading eyebrow="Kutipan" title={quote.title} subtitle={quote.subtitle} titleId="quote-title" />

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-stretch">
        {/* Kutipan utama / ayat */}
        <Reveal className="h-full min-w-0" delay={0.06}>
          <blockquote className="paper-card relative flex h-full flex-col rounded-3xl px-6 py-8 sm:px-9 sm:py-10">
            <span
              className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 gold-rule"
              aria-hidden="true"
            />
            <motion.span
              className="mx-auto mb-4 block"
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              <Rose size={44} tone="blue" rotate={-8} />
            </motion.span>

            <Icon name="quote" size={22} className="mx-auto text-champagne/70" />

            <Stagger className="mt-5 flex-1 space-y-3 text-center" stagger={0.16}>
              {quote.lines.map((line, index) => (
                <StaggerItem key={index}>
                  <p className="font-serif text-[17px] italic leading-relaxed text-cocoa-600 sm:text-lg">{line}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <footer className="mt-7 text-center">
              <span className="mx-auto block h-px w-14 gold-rule" aria-hidden="true" />
              <cite className="mt-4 block not-italic">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-champagne-700">
                  {quote.source?.label ? `${quote.source.label} · ` : ''}
                  {quote.source?.text}
                </span>
              </cite>
            </footer>
          </blockquote>
        </Reveal>

        {/* Kutipan romantis tambahan (opsional) */}
        {quote.romanticQuote?.lines?.length ? (
          <Reveal className="h-full min-w-0" delay={0.16}>
            <div className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-champagne/25 bg-[linear-gradient(160deg,rgba(247,245,239,0.9),rgba(233,227,213,0.55))] px-6 py-10 text-center sm:px-10">
              <span
                className="pointer-events-none absolute inset-4 rounded-[1.25rem] border border-champagne/15"
                aria-hidden="true"
              />
              <p className="relative font-script text-4xl text-gilded sm:text-5xl">
                {weddingConfig.couple.bride.nickname} &amp; {weddingConfig.couple.groom.nickname}
              </p>

              <Divider className="relative my-7 w-full" />

              <div className="relative space-y-2">
                {quote.romanticQuote.lines.map((line, index) => (
                  <motion.p
                    key={index}
                    className="font-serif text-base italic leading-relaxed text-cocoa-400 sm:text-lg"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, delay: 0.15 + index * 0.14, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              {quote.romanticQuote.source ? (
                <p className="relative mt-6 font-sans text-[10px] font-bold uppercase tracking-[0.26em] text-champagne-700">
                  {quote.romanticQuote.source}
                </p>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </div>
    </SectionShell>
  )
}
