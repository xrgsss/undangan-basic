import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { weddingConfig } from '../data/weddingConfig'
import { buildMapsEmbedUrl, buildMapsUrl } from '../lib/utils'
import Countdown from '../components/Countdown'
import EventCard from '../components/EventCard'
import Icon from '../components/Icon'
import SectionShell from '../components/SectionShell'
import SectionHeading from '../components/SectionHeading'
import Button from '../components/Button'
import { Reveal } from '../components/Motion'

/* ============================================================================
 *  EventSection — detail acara, countdown, dress code, dan lokasi (peta).
 *  Bagian peta memiliki id "maps" agar dapat dituju dari menu navigasi.
 * ========================================================================== */
export default function EventSection() {
  const { event } = weddingConfig
  const reduce = useReducedMotion()
  const venues = [event.akad, event.resepsi]
  const [activeVenue, setActiveVenue] = useState(0)

  const venue = venues[activeVenue]
  const embedUrl = buildMapsEmbedUrl(venue)
  const externalUrl = buildMapsUrl(venue)

  return (
    <SectionShell id="event" ornament ornamentPosition="top-left" labelledBy="event-title">
      <SectionHeading
        eyebrow="Save The Date"
        title="Detail Acara"
        subtitle="Kami menantikan kehadiran Anda di hari bahagia kami"
        titleId="event-title"
      />

      <Reveal delay={0.1} className="mt-6">
        <p className="mx-auto max-w-3xl text-center text-[13px] leading-relaxed text-cocoa-400 sm:text-sm">{event.intro}</p>
      </Reveal>

      <Countdown targetISO={event.dateISO} className="mt-10" />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {venues.map((data, index) => (
          <motion.div
            key={data.title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="h-full min-w-0"
          >
            <EventCard data={data} />
          </motion.div>
        ))}
      </div>

      {/* Dress code */}
      {event.dressCode?.colors?.length ? (
        <Reveal delay={0.16} className="mt-6">
          <div className="paper-card rounded-3xl px-5 py-6 text-center sm:px-8">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-champagne-600">
              {event.dressCode.label || 'Dress Code'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {event.dressCode.colors.map((color) => (
                <span key={color} className="group flex flex-col items-center gap-2">
                  <span
                    className="h-9 w-9 rounded-full border border-white/70 shadow-soft transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cocoa-300">{color}</span>
                </span>
              ))}
            </div>
            {event.dressCode.note ? (
              <p className="mx-auto mt-4 max-w-lg font-serif text-[13px] italic text-cocoa-400">{event.dressCode.note}</p>
            ) : null}
            <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] text-cocoa-300">
              Waktu: {event.timeZoneLabel}
            </p>
          </div>
        </Reveal>
      ) : null}

      {/* ---------------- LOKASI / MAPS ---------------- */}
      <div id="maps" className="mt-16 scroll-mt-24 sm:mt-20">
        <Reveal>
          <div className="text-center">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.36em] text-champagne-600">Lokasi Acara</p>
            <h3 className="mt-3 font-display text-2xl text-cocoa sm:text-3xl">Peta &amp; Alamat</h3>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-6">
          <div className="flex justify-center gap-2" role="tablist" aria-label="Pilih lokasi acara">
            {venues.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={activeVenue === index}
                aria-controls={`venue-panel-${index}`}
                id={`venue-tab-${index}`}
                onClick={() => setActiveVenue(index)}
                className={`relative rounded-full border px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${
                  activeVenue === index
                    ? 'border-champagne/60 bg-champagne/12 text-champagne-700'
                    : 'border-champagne/25 bg-white/60 text-cocoa-400 hover:border-champagne/45'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-6">
          <div
            id={`venue-panel-${activeVenue}`}
            role="tabpanel"
            aria-labelledby={`venue-tab-${activeVenue}`}
            className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          >
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-champagne/25 bg-ivory-100 shadow-card sm:aspect-[16/10]">
              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  title={`Peta lokasi ${venue.title} — ${venue.venue}`}
                  src={embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <div className="grid h-full place-items-center px-6 text-center">
                  <p className="text-[13px] leading-relaxed text-cocoa-400">
                    Koordinat lokasi belum diisi pada konfigurasi. Tambahkan <code className="font-mono">lat</code> dan{' '}
                    <code className="font-mono">lng</code> pada <code className="font-mono">weddingConfig.event</code>.
                  </p>
                </div>
              )}
            </div>

            <div className="paper-card flex flex-col justify-center rounded-3xl px-6 py-7">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-champagne/40 bg-champagne/10 text-champagne-700" aria-hidden="true">
                <Icon name="map" size={19} />
              </span>
              <h4 className="mt-4 font-display text-xl text-cocoa">{venue.venue}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-cocoa-400">{venue.address}</p>

              <dl className="mt-5 space-y-2 border-t border-champagne/20 pt-4 text-[12px] text-cocoa-400">
                <div className="flex items-center gap-2">
                  <Icon name="calendar" size={14} className="text-champagne-600" />
                  <dt className="sr-only">Tanggal</dt>
                  <dd>{venue.dateLabel}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="clock" size={14} className="text-champagne-600" />
                  <dt className="sr-only">Waktu</dt>
                  <dd>
                    {venue.timeStart} – {venue.timeEnd} {venue.timezone}
                  </dd>
                </div>
              </dl>

              {externalUrl ? (
                <Button
                  className="mt-6"
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="gold"
                  icon="navigation"
                  fullWidth
                >
                  Buka di Google Maps
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
