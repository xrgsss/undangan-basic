import { weddingConfig } from '../data/weddingConfig'

/* ============================================================================
 *  Kumpulan helper umum: kelas CSS, format tanggal, tautan peta, kalender.
 *  Semua fungsi murni (pure) agar mudah diuji dan dipakai ulang.
 * ========================================================================== */

/** Gabungkan kelas CSS secara kondisional (pengganti ringan clsx). */
export function cn(...values) {
  const out = []
  for (const value of values) {
    if (!value) continue
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value))
    } else if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else if (typeof value === 'object') {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) out.push(key)
      }
    }
  }
  return out.join(' ')
}

/** Batasi angka pada rentang tertentu. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/** Beri angka nol di depan (2 → "02"). */
export function pad(value, length = 2) {
  return String(Math.max(0, Math.trunc(value))).padStart(length, '0')
}

/** Cek apakah sebuah string adalah tanggal ISO yang valid. */
export function isValidDateISO(value) {
  if (!value || typeof value !== 'string') return false
  const time = new Date(value).getTime()
  return Number.isFinite(time)
}

/**
 * Format tanggal panjang sesuai locale & zona waktu undangan.
 * Mengembalikan string kosong bila tanggal tidak valid (tidak pernah crash).
 */
export function formatDateLong(value, options = {}) {
  if (!isValidDateISO(value)) return ''
  const { locale, timeZone } = weddingConfig.meta
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone,
      ...options,
    }).format(new Date(value))
  } catch {
    return ''
  }
}

/** Format tanggal + jam ringkas, mis. "14 Nov 2026, 08.00". */
export function formatDateTimeShort(value) {
  if (!isValidDateISO(value)) return ''
  const { locale, timeZone } = weddingConfig.meta
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    })
      .format(new Date(value))
      .replace(':', '.')
  } catch {
    return ''
  }
}

/** Format waktu relatif sederhana untuk daftar ucapan ("2 jam lalu"). */
export function formatRelative(value) {
  if (!isValidDateISO(value)) return ''
  const diff = Date.now() - new Date(value).getTime()
  if (diff < 0) return 'baru saja'
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'baru saja'
  if (diff < hour) return `${Math.floor(diff / minute)} menit lalu`
  if (diff < day) return `${Math.floor(diff / hour)} jam lalu`
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`
  return formatDateLong(value, { weekday: undefined })
}

/**
 * Ubah label jam ("08.00") menjadi ISO lengkap dengan offset yang sama
 * seperti dateISO. Dipakai untuk tautan kalender & data terstruktur.
 */
export function combineDateAndTime(dateISO, timeLabel, fallbackOffset = '+07:00') {
  if (!isValidDateISO(dateISO)) return ''
  const datePart = dateISO.slice(0, 10)
  const offset = dateISO.slice(19) || fallbackOffset
  const [hourRaw = '00', minuteRaw = '00'] = String(timeLabel || '').replace('.', ':').split(':')
  const hour = pad(clamp(Number.parseInt(hourRaw, 10) || 0, 0, 23))
  const minute = pad(clamp(Number.parseInt(minuteRaw, 10) || 0, 0, 59))
  return `${datePart}T${hour}:${minute}:00${offset}`
}

/** Offset zona waktu dari string ISO ("+07:00" / "Z"). */
export function getIsoOffset(dateISO, fallback = '+07:00') {
  if (!isValidDateISO(dateISO)) return fallback
  return dateISO.slice(19) || fallback
}

/* ------------------------------- PETA ---------------------------------- */

/** Tautan Google Maps dari konfigurasi tempat (prioritas: mapsUrl → koordinat → alamat). */
export function buildMapsUrl(place = {}) {
  if (place.mapsUrl) return place.mapsUrl
  const hasCoords = Number.isFinite(place.lat) && Number.isFinite(place.lng)
  const query = hasCoords ? `${place.lat},${place.lng}` : [place.venue, place.address].filter(Boolean).join(', ')
  if (!query) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** URL embed Google Maps (iframe) — tidak memerlukan API key. */
export function buildMapsEmbedUrl(place = {}) {
  const hasCoords = Number.isFinite(place.lat) && Number.isFinite(place.lng)
  const query = hasCoords ? `${place.lat},${place.lng}` : [place.venue, place.address].filter(Boolean).join(', ')
  if (!query) return ''
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=${weddingConfig.meta.locale.split('-')[0]}&z=16&output=embed`
}

/* ----------------------------- KALENDER -------------------------------- */

/**
 * Bangun tautan "Add to Google Calendar".
 * Mengembalikan string kosong bila data tanggal tidak valid.
 */
export function buildGoogleCalendarUrl({ title, description = '', location = '', startISO, endISO }) {
  if (!isValidDateISO(startISO)) return ''
  const end = isValidDateISO(endISO) ? endISO : startISO
  const toCal = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Undangan Pernikahan',
    dates: `${toCal(startISO)}/${toCal(end)}`,
    details: description,
    location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Isi file .ics (Apple Calendar / Outlook / Google Calendar import). */
export function buildIcsContent({ title, description = '', location = '', startISO, endISO, uid }) {
  if (!isValidDateISO(startISO)) return ''
  const toUtc = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const escape = (text) => String(text).replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n')
  const end = isValidDateISO(endISO) ? endISO : new Date(new Date(startISO).getTime() + 3_600_000).toISOString()
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UndanganDigital//ID//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || `${Date.now()}@undangan`}`,
    `DTSTAMP:${toUtc(new Date().toISOString())}`,
    `DTSTART:${toUtc(startISO)}`,
    `DTEND:${toUtc(end)}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Unduh file .ics melalui blob (tanpa server). */
export function downloadIcs(filename, content) {
  if (!content) return false
  try {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    // Beri jeda sebelum revoke agar Safari sempat memulai unduhan.
    setTimeout(() => URL.revokeObjectURL(url), 4000)
    return true
  } catch {
    return false
  }
}

/* ------------------------------ LAIN-LAIN ------------------------------- */

/** Copy ke clipboard dengan fallback untuk browser/jaringan non-HTTPS. */
export async function copyText(text) {
  const value = String(text ?? '')
  if (!value) return false
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    /* lanjut ke fallback */
  }
  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, value.length)
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/** Bersihkan teks dari karakter kontrol & rapikan spasi. */
export function sanitizeText(value, maxLength = 500) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/** Ambil nama tamu dari parameter URL (?to=Nama+Tamu). */
export function getGuestNameFromUrl() {
  if (typeof window === 'undefined') return ''
  try {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('to') || params.get('kepada') || params.get('nama') || ''
    const cleaned = decodeURIComponent(raw).replace(/\+/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
    return cleaned.slice(0, 80)
  } catch {
    return ''
  }
}

/** Kelompokkan nomor rekening agar mudah dibaca (4 digit per blok). */
export function groupDigits(value, size = 4) {
  const clean = String(value ?? '').replace(/\s+/g, '')
  if (clean.length <= size) return clean
  return clean.replace(new RegExp(`(.{${size}})`, 'g'), '$1 ').trim()
}

/** Buat tautan WhatsApp (nomor format internasional tanpa '+' atau spasi). */
export function buildWhatsappUrl(phone, text = '') {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${normalized}${query}`
}

/** Data terstruktur schema.org untuk membantu mesin pencari. */export function buildStructuredData() {
  const { meta, event, couple } = weddingConfig
  const place = event.resepsi
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Pernikahan ${couple.bride.nickname} & ${couple.groom.nickname}`,
    startDate: event.dateISO,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: meta.description,
    image: [`${meta.siteUrl}/og-image.png`],
    location: {
      '@type': 'Place',
      name: place.venue,
      address: { '@type': 'PostalAddress', streetAddress: place.address, addressCountry: 'ID' },
    },
    organizer: { '@type': 'Person', name: `${couple.bride.fullName} & ${couple.groom.fullName}` },
  }
}

/**
 * Scroll halus menuju section navigasi.
 * Menghormati preferensi `prefers-reduced-motion` (langsung lompat bila aktif)
 * dan memakai `scroll-margin-top` pada section untuk offset header.
 */
export function scrollToSection(id, { focus = true } = {}) {
  if (typeof document === 'undefined') return false
  const element = document.getElementById(id)
  if (!element) return false

  const reduce =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

  // Pindahkan fokus ke section agar pembaca layar & keyboard ikut berpindah.
  if (focus) {
    window.setTimeout(
      () => {
        element.setAttribute('tabindex', '-1')
        element.focus({ preventScroll: true })
      },
      reduce ? 0 : 620,
    )
  }
  return true
}
