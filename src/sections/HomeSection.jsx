import { weddingConfig } from '../data/weddingConfig'
import { buildGoogleCalendarUrl, combineDateAndTime, formatDateLong, scrollToSection } from '../lib/utils'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Monogram from '../components/Monogram'
import SectionShell from '../components/SectionShell'
import { CornerBloom, Divider, SoftBlob } from '../components/FloralDecoration'
import { Reveal } from '../components/Motion'

/* ============================================================================
 *  HomeSection — sambutan pertama setelah cover dibuka.
 *  Menampilkan monogram, nama pengantin, tanggal, dan ajakan menyimpan tanggal.
 * ========================================================================== */
export default function HomeSection({ guestName }) {
  const { couple, event, meta } = weddingConfig
  const initials = `${couple.bride.initials} & ${couple.groom.initials}`
  const dateLabel = event.dateLabel || formatDateLong(event.dateISO)
  const startISO = combineDateAndTime(event.dateISO, event.akad.timeStart)
  const endISO = combineDateAndTime(event.dateISO, event.resepsi.timeEnd)

  const calendarUrl = buildGoogleCalendarUrl({
    title: `Pernikahan ${couple.bride.nickname} & ${couple.groom.nickname}`,
    description: `${event.intro}\n\n${meta.siteUrl}`,
    location: event.resepsi.calendarLocation || `${event.resepsi.venue}, ${event.resepsi.address}`,
    startISO,
    endISO,
  })

  return (
    <SectionShell
      id="home"
      labelledBy="home-title"
      spacing="py-24 sm:py-28 lg:py-32"
      className="flex min-h-svh items-center"
      innerClassName="max-w-3xl"
    >
      <SoftBlob className="-left-28 -top-24" color="#7188A5" opacity={0.14} size={420} />
      <SoftBlob className="-right-24 bottom-0" color="#77785F" opacity={0.12} size={380} />
      <CornerBloom position="top-right" scale={0.6} opacity={0.4} float={false} className="-right-16 -top-8 sm:-right-6 sm:top-2" />
      <CornerBloom position="bottom-left" scale={0.55} opacity={0.32} float={false} className="-bottom-10 -left-16 sm:-left-8" />

      <div className="relative text-center">
        <Reveal y={14} duration={0.6}>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-champagne-600 sm:text-[11px]">
            {weddingConfig.cover.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.08} scale={0.9} y={0} duration={0.8}>
          <Monogram initials={initials} size={128} className="mt-6" />
        </Reveal>

        <Reveal delay={0.18}>
          <h1 id="home-title" className="mt-6 font-script text-[3.25rem] leading-[1.1] text-gilded sm:text-7xl lg:text-[5.5rem]">
            {couple.bride.nickname} <span className="mx-1 inline-block text-champagne">&amp;</span> {couple.groom.nickname}
          </h1>
        </Reveal>

        <Reveal delay={0.26}>
          <p className="mt-4 font-sans text-[11px] font-bold uppercase tracking-[0.36em] text-cocoa-400 sm:text-xs">
            {dateLabel}
          </p>
        </Reveal>

        <Reveal delay={0.32}>
          <Divider className="my-8" />
        </Reveal>

        <Reveal delay={0.38}>
          <div className="paper-card mx-auto max-w-xl rounded-2xl px-5 py-5 sm:px-7">
            <p className="font-serif text-[15px] leading-relaxed text-cocoa-400 sm:text-base">
              Assalamualaikum Warahmatullahi Wabarakatuh
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-cocoa-400 sm:text-sm">
              Tanpa mengurangi rasa hormat, kami mengundang{' '}
              <span className="font-display text-[15px] text-cocoa">{guestName}</span> untuk hadir di hari pernikahan
              kami. Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.44}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {calendarUrl ? (
              <Button
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="gold"
                size="lg"
                icon="calendar"
                className="w-full sm:w-auto"
              >
                Simpan Tanggal
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="lg"
              icon="heart"
              className="w-full sm:w-auto"
              onClick={() => scrollToSection('event')}
            >
              Lihat Detail Acara
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.5}>
          <button
            type="button"
            onClick={() => scrollToSection('quote')}
            className="group mt-12 inline-flex flex-col items-center gap-2 rounded-2xl px-4 py-2 text-cocoa-300 transition-colors hover:text-champagne-700"
            aria-label="Gulir ke bagian berikutnya"
          >
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.3em]">Gulir ke bawah</span>
            <Icon name="chevronDown" size={18} className="animate-float" />
          </button>
        </Reveal>
      </div>
    </SectionShell>
  )
}
