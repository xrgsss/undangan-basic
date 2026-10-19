import { weddingConfig } from '../data/weddingConfig'
import { buildGoogleCalendarUrl, buildIcsContent, buildMapsUrl, combineDateAndTime, downloadIcs } from '../lib/utils'
import Button from './Button'
import Icon from './Icon'
import { useToast } from './Toast'

/* ============================================================================
 *  EventCard — kartu detail satu rangkaian acara (akad nikah / resepsi).
 *  Tombol "Lihat Lokasi" & "Tambahkan ke Kalender" benar-benar berfungsi:
 *   • Lokasi  → Google Maps (koordinat bila tersedia, selain itu alamat).
 *   • Kalender → tautan Google Calendar + opsi unduh berkas .ics.
 * ========================================================================== */
export default function EventCard({ data, className = '' }) {
  const { showToast } = useToast()
  const { couple, meta } = weddingConfig
  const coupleLabel = `${couple.bride.nickname} & ${couple.groom.nickname}`

  const startISO = combineDateAndTime(weddingConfig.event.dateISO, data.timeStart)
  const endISO = combineDateAndTime(weddingConfig.event.dateISO, data.timeEnd)

  const mapsUrl = buildMapsUrl(data)
  const calendarUrl = buildGoogleCalendarUrl({
    title: `${data.title} — Pernikahan ${coupleLabel}`,
    description: `${data.title} pernikahan ${couple.bride.fullName} & ${couple.groom.fullName}.\n\n${weddingConfig.event.intro}\n\n${meta.siteUrl}`,
    location: data.calendarLocation || `${data.venue}, ${data.address}`,
    startISO,
    endISO,
  })

  const handleIcs = () => {
    const content = buildIcsContent({
      title: `${data.title} — Pernikahan ${coupleLabel}`,
      description: `${data.title} pernikahan ${couple.bride.fullName} & ${couple.groom.fullName}. ${meta.siteUrl}`,
      location: data.calendarLocation || `${data.venue}, ${data.address}`,
      startISO,
      endISO,
      uid: `${data.title.replace(/\s+/g, '-').toLowerCase()}-${startISO}@undangan`,
    })
    const ok = downloadIcs(`${data.title.replace(/\s+/g, '-').toLowerCase()}-${couple.bride.initials}${couple.groom.initials}.ics`, content)
    showToast(ok ? 'Berkas kalender diunduh.' : 'Tidak dapat membuat berkas kalender.', {
      tone: ok ? 'success' : 'error',
      icon: ok ? 'check' : 'error',
    })
  }

  return (
    <article
      className={`paper-card relative flex h-full flex-col overflow-hidden rounded-3xl px-6 pb-6 pt-8 text-center ${className}`}
    >
      {/* garis emas atas */}
      <span className="absolute inset-x-8 top-0 h-px gold-rule" aria-hidden="true" />

      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-champagne/40 bg-[radial-gradient(circle_at_35%_30%,#fffdf8,#f0e7d5)] text-champagne-700 shadow-soft">
        <Icon name={data.icon === 'rings' ? 'heartHandshake' : 'party'} size={22} />
      </span>

      <h3 className="mt-4 font-display text-2xl text-cocoa">{data.title}</h3>

      <div className="mt-3 space-y-1.5 font-serif text-cocoa-400">
        <p className="text-base">{data.dateLabel}</p>
        <p className="flex items-center justify-center gap-2 text-sm">
          <Icon name="clock" size={14} className="text-champagne-600" />
          <span>
            {data.timeStart} – {data.timeEnd} {data.timezone}
          </span>
        </p>
      </div>

      <span className="mx-auto mt-5 block h-px w-20 gold-rule" aria-hidden="true" />

      <div className="mt-5 flex-1">
        <p className="font-display text-lg leading-snug text-cocoa">{data.venue}</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-cocoa-400">{data.address}</p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {mapsUrl ? (
          <Button
            as="a"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            icon="map"
            size="md"
            fullWidth
            aria-label={`Lihat lokasi ${data.title} di Google Maps`}
          >
            Lihat Lokasi
          </Button>
        ) : (
          <p className="rounded-xl border border-champagne/25 bg-white/60 px-3 py-2 text-[11px] text-cocoa-300">
            Tautan lokasi belum diatur pada konfigurasi.
          </p>
        )}

        {calendarUrl ? (
          <Button
            as="a"
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="gold"
            icon="calendar"
            size="md"
            fullWidth
            aria-label={`Tambahkan ${data.title} ke Google Calendar`}
          >
            Tambahkan ke Kalender
          </Button>
        ) : null}

        {startISO ? (
          <button
            type="button"
            onClick={handleIcs}
            className="mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cocoa-300 transition-colors hover:text-champagne-700"
          >
            <Icon name="arrowDown" size={13} />
            Unduh .ics (Apple / Outlook)
          </button>
        ) : null}
      </div>
    </article>
  )
}
