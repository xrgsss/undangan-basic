import { weddingConfig } from '../data/weddingConfig'
import { scrollToSection } from '../lib/utils'
import { CornerBloom, Divider, PetalField } from './FloralDecoration'
import Icon from './Icon'
import Monogram from './Monogram'
import { Reveal } from './Motion'

/* ============================================================================
 *  Footer — bagian penutup undangan (ucapan terima kasih & salam).
 * ========================================================================== */
export default function Footer() {
  const { closing, couple, meta } = weddingConfig
  const initials = `${couple.bride.initials} & ${couple.groom.initials}`

  return (
    <footer className="relative isolate overflow-hidden px-5 pb-8 pt-14 sm:px-8 md:pb-16 md:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px gold-rule"
        aria-hidden="true"
      />
      <PetalField className="opacity-60" />
      <CornerBloom position="bottom-left" scale={0.5} opacity={0.3} float={false} className="-bottom-12 -left-16 sm:-left-10" />
      <CornerBloom position="bottom-right" scale={0.5} opacity={0.3} float={false} className="-bottom-12 -right-16 sm:-right-10" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <Monogram initials={initials} size={104} animate={false} />
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-6 font-display text-3xl text-cocoa sm:text-4xl">{closing.title}</h2>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mx-auto mt-5 max-w-xl space-y-1.5">
            {closing.lines.map((line, index) => (
              <p key={index} className="font-serif text-[15px] italic leading-relaxed text-cocoa-400 sm:text-base">
                {line}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <Divider className="my-8" />
        </Reveal>

        <Reveal delay={0.24}>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-champagne-600">Kami yang berbahagia</p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-8">
            {closing.families.map((family) => (
              <p key={family} className="font-display text-[15px] text-cocoa">
                {family}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mt-8 font-script text-3xl text-gilded sm:text-4xl">
            {couple.bride.nickname} &amp; {couple.groom.nickname}
          </p>
          <p className="mt-3 font-serif text-sm italic text-cocoa-400">{closing.salam}</p>
        </Reveal>

        <Reveal delay={0.36}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-champagne/30 bg-white/60 px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-700">
              {meta.hashtag}
            </span>
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className="inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-white/60 px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-cocoa-400 transition-colors hover:text-champagne-700"
            >
              <Icon name="arrowUp" size={13} />
              Kembali ke Atas
            </button>
          </div>
        </Reveal>

        <p className="mt-10 text-[10px] leading-relaxed text-cocoa-300">
          Undangan digital ini dibuat dengan sepenuh hati untuk {couple.bride.nickname} &amp; {couple.groom.nickname}.
          <br className="hidden sm:block" /> Mohon maaf apabila terdapat kekurangan dalam penyampaian undangan ini.
        </p>
      </div>
    </footer>
  )
}
