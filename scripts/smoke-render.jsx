/**
 * smoke-render.jsx — pemeriksaan cepat tanpa browser.
 * ----------------------------------------------------------------------------
 * Merender seluruh pohon komponen undangan memakai React SSR. Ini menangkap
 * kesalahan import, komponen tak terdefinisi, dan error saat render — jauh
 * lebih cepat daripada membuka browser hanya untuk memeriksa hal yang sama.
 *
 *   npm run smoke
 */

import { renderToString } from 'react-dom/server'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import App from '../src/App'
import { weddingConfig } from '../src/data/weddingConfig'
import { isSupabaseConfigured as isSupabaseConfiguredForSmoke } from '../src/services/supabaseClient'
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildMapsEmbedUrl,
  buildMapsUrl,
  combineDateAndTime,
  groupDigits,
} from '../src/lib/utils'
import { validateRsvp, toWishPayload, ATTENDANCE } from '../src/lib/validation'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

let failures = 0

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  OK   ${label}`)
  } else {
    failures += 1
    console.log(`  GAGAL ${label}${detail ? ` → ${detail}` : ''}`)
  }
}

console.log('\n1) Render seluruh halaman (React SSR)')
let html = ''
try {
  html = renderToString(<App />)
  check('App berhasil dirender', html.length > 5000, `${html.length} karakter`)
} catch (error) {
  check('App berhasil dirender', false, error.stack?.split('\n').slice(0, 4).join(' | '))
}

console.log('\n2) Konten penting muncul di HTML')
const expectations = [
  ['Halaman cover', 'Buka Undangan'],
  ['Nama mempelai', weddingConfig.couple.bride.nickname],
  ['Nama mempelai pria', weddingConfig.couple.groom.nickname],
  ['Section Home', 'id="home"'],
  ['Section Quotes', 'id="quote"'],
  ['Section Mempelai', 'id="couple"'],
  ['Section Acara', 'id="event"'],
  ['Section Maps', 'id="maps"'],
  ['Section Gallery', 'id="gallery"'],
  ['Section RSVP', 'id="rsvp"'],
  ['Section Gift', 'id="gift"'],
  ['Tombol kalender', 'calendar.google.com'],
  ['Peta tersemat', 'maps.google.com/maps'],
  ['Formulir RSVP', 'Kirim Ucapan'],
  ['Galeri foto', 'images/gallery/gallery-01.svg'],
  ['Foto mempelai', 'images/couple/bride.svg'],
  ['Nomor rekening', groupDigits(weddingConfig.gift.accounts[0].accountNumber)],
  // Pada SSR, useEffect belum berjalan sehingga daftar ucapan tampil dalam
  // keadaan memuat — ini memang perilaku yang diharapkan.
  ['Keadaan memuat ucapan', 'Memuat ucapan tamu'],
  ['Pemberitahuan mode penyimpanan', isSupabaseConfiguredForSmoke ? 'Terhubung ke Supabase' : 'Mode Demo Aktif'],
]
for (const [label, needle] of expectations) {
  check(label, html.includes(needle), `"${needle}" tidak ditemukan`)
}

console.log('\n3) Data & tautan')
check('Tanggal acara valid', Number.isFinite(new Date(weddingConfig.event.dateISO).getTime()))
check(
  'Batas RSVP lebih awal dari hari acara',
  new Date(weddingConfig.event.rsvpDeadlineISO) < new Date(weddingConfig.event.dateISO),
)
check(
  'Tanggal acara masih di masa depan',
  new Date(weddingConfig.event.dateISO).getTime() > Date.now(),
  'perbarui weddingConfig.event.dateISO',
)

const akadStart = combineDateAndTime(weddingConfig.event.dateISO, weddingConfig.event.akad.timeStart)
const akadEnd = combineDateAndTime(weddingConfig.event.dateISO, weddingConfig.event.akad.timeEnd)
check('combineDateAndTime menghasilkan ISO valid', Number.isFinite(new Date(akadStart).getTime()), akadStart)
check('Waktu selesai setelah waktu mulai', new Date(akadEnd) > new Date(akadStart))

const mapsUrl = buildMapsUrl(weddingConfig.event.resepsi)
check('Tautan Google Maps terbentuk', mapsUrl.startsWith('https://www.google.com/maps'), mapsUrl)
const embedUrl = buildMapsEmbedUrl(weddingConfig.event.resepsi)
check('URL embed peta terbentuk', embedUrl.includes('output=embed'), embedUrl)

const calendarUrl = buildGoogleCalendarUrl({
  title: 'Test',
  startISO: akadStart,
  endISO: akadEnd,
  location: 'Test',
})
check('Tautan Google Calendar terbentuk', calendarUrl.includes('action=TEMPLATE'), calendarUrl)

const ics = buildIcsContent({ title: 'Test', startISO: akadStart, endISO: akadEnd })
check('Berkas .ics valid', ics.startsWith('BEGIN:VCALENDAR') && ics.includes('END:VEVENT'))

console.log('\n4) Validasi formulir RSVP')
const config = weddingConfig.rsvp
const invalid = validateRsvp({ name: '', attendance: 'hadir', guests: 1, message: '' }, config)
check('Menolak data kosong', invalid.valid === false && Boolean(invalid.errors.name && invalid.errors.message))
const tooMany = validateRsvp(
  { name: 'Budi', attendance: ATTENDANCE.HADIR, guests: config.maxGuests + 5, message: 'Selamat ya!' },
  config,
)
check('Menolak jumlah tamu melebihi batas', Boolean(tooMany.errors.guests))
const valid = validateRsvp({ name: 'Budi', attendance: ATTENDANCE.HADIR, guests: 2, message: 'Selamat menempuh hidup baru!' }, config)
check('Menerima data yang sah', valid.valid === true)
const payload = toWishPayload({ name: '  Budi  ', attendance: ATTENDANCE.TIDAK_HADIR, guests: 5, message: '  Maaf tidak bisa hadir  ' }, config)
check('Payload bersih & konsisten', payload.name === 'Budi' && payload.guests === 0, JSON.stringify(payload))

console.log('\n5) Struktur navigasi')
const navIds = weddingConfig.navigation.map((item) => item.id)
for (const id of navIds) {
  check(`Section #${id} ada di HTML`, html.includes(`id="${id}"`))
}
const primaryMissing = weddingConfig.primaryNavIds.filter((id) => !navIds.includes(id))
check('primaryNavIds valid', primaryMissing.length === 0, primaryMissing.join(', '))

console.log('\n6) Aset (gambar, musik, favicon)')
const requiredAssets = [
  'favicon.svg',
  'manifest.webmanifest',
  'og-image.png',
  'audio/wedding-bgm.wav',
  'images/couple/bride.svg',
  'images/couple/groom.svg',
  ...weddingConfig.gallery.photos.map((photo) => photo.src.replace(/^\//, '')),
]

for (const asset of requiredAssets) {
  const filePath = join(publicDir, asset)
  if (!existsSync(filePath)) {
    check(`Aset ${asset}`, false, 'berkas tidak ditemukan — jalankan "npm run assets"')
    continue
  }
  const { size } = statSync(filePath)
  check(`Aset ${asset}`, size > 200, `hanya ${size} byte`)
}

// Verifikasi berkas WAV benar-benar berisi audio (bukan file kosong/rusak).
const wav = readFileSync(join(publicDir, 'audio/wedding-bgm.wav'))
const wavOk =
  wav.toString('ascii', 0, 4) === 'RIFF' &&
  wav.toString('ascii', 8, 12) === 'WAVE' &&
  wav.toString('ascii', 36, 40) === 'data'
check('Header WAV valid', wavOk)
if (wavOk) {
  const sampleRate = wav.readUInt32LE(24)
  const seconds = wav.readUInt32LE(40) / 2 / sampleRate
  let peak = 0
  for (let i = 44; i < wav.length - 1; i += 200) {
    peak = Math.max(peak, Math.abs(wav.readInt16LE(i)))
  }
  check('Durasi musik wajar', seconds > 10, `${seconds.toFixed(1)} detik`)
  check('Musik tidak senyap', peak > 3000, `puncak amplitudo ${peak}`)
}

// Verifikasi berkas SVG dapat diparse sebagai gambar.
for (const asset of requiredAssets.filter((file) => file.endsWith('.svg'))) {
  const svg = readFileSync(join(publicDir, asset), 'utf8')
  const balanced =
    svg.trimStart().startsWith('<svg') &&
    svg.trimEnd().endsWith('</svg>') &&
    (svg.match(/</g) ?? []).length === (svg.match(/>/g) ?? []).length
  check(`SVG ${asset} valid`, balanced)
}

console.log(`\n${failures === 0 ? 'SEMUA PEMERIKSAAN LULUS' : `${failures} PEMERIKSAAN GAGAL`}\n`)
if (failures > 0) process.exitCode = 1
