import { sanitizeText } from './utils'

/* ============================================================================
 *  Validasi formulir RSVP.
 *  Dipakai oleh dua lapisan:
 *   1. Komponen RSVPForm (validasi langsung sebelum kirim)
 *   2. rsvpService (validasi ulang sebelum "dikirim") — meniru server-side
 *      validation. Pada Supabase, aturan yang sama ditegakkan oleh fungsi
 *      PostgreSQL + CHECK constraint (lihat supabase/schema.sql).
 * ========================================================================== */

export const ATTENDANCE = {
  HADIR: 'hadir',
  TIDAK_HADIR: 'tidak_hadir',
  RAGU: 'ragu',
}

export const ATTENDANCE_OPTIONS = [
  { value: ATTENDANCE.HADIR, label: 'Hadir', hint: 'InsyaAllah saya akan datang' },
  { value: ATTENDANCE.TIDAK_HADIR, label: 'Tidak Hadir', hint: 'Mohon maaf, saya tidak dapat hadir' },
  { value: ATTENDANCE.RAGU, label: 'Masih Ragu', hint: 'Belum bisa memastikan' },
]

export const ATTENDANCE_LABEL = {
  [ATTENDANCE.HADIR]: 'Hadir',
  [ATTENDANCE.TIDAK_HADIR]: 'Tidak Hadir',
  [ATTENDANCE.RAGU]: 'Masih Ragu',
}

/** Nilai awal formulir. */
export function createInitialValues(guestName = '') {
  return {
    name: guestName || '',
    attendance: ATTENDANCE.HADIR,
    guests: 1,
    message: '',
  }
}

/**
 * Validasi nilai formulir.
 * @returns {{ valid: boolean, errors: Record<string,string> }}
 */
export function validateRsvp(values, config) {
  const errors = {}
  const name = sanitizeText(values?.name, config.nameMaxLength)
  const message = sanitizeText(values?.message, config.messageMaxLength)

  if (!name) {
    errors.name = 'Mohon isi nama Anda.'
  } else if (name.length < 2) {
    errors.name = 'Nama terlalu pendek (minimal 2 karakter).'
  } else if (String(values?.name ?? '').length > config.nameMaxLength) {
    errors.name = `Nama maksimal ${config.nameMaxLength} karakter.`
  }

  if (!Object.values(ATTENDANCE).includes(values?.attendance)) {
    errors.attendance = 'Mohon pilih salah satu konfirmasi kehadiran.'
  }

  if (values?.attendance === ATTENDANCE.HADIR) {
    const guests = Number(values?.guests)
    if (!Number.isInteger(guests) || guests < 1) {
      errors.guests = 'Jumlah tamu minimal 1 orang.'
    } else if (guests > config.maxGuests) {
      errors.guests = `Jumlah tamu maksimal ${config.maxGuests} orang.`
    }
  }

  if (!message) {
    errors.message = 'Mohon tuliskan ucapan atau doa Anda.'
  } else if (message.length < config.messageMinLength) {
    errors.message = `Ucapan minimal ${config.messageMinLength} karakter.`
  } else if (message.length > config.messageMaxLength) {
    errors.message = `Ucapan maksimal ${config.messageMaxLength} karakter.`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/** Bentuk payload siap disimpan dari nilai formulir. */
export function toWishPayload(values, config) {
  const attendance = Object.values(ATTENDANCE).includes(values.attendance) ? values.attendance : ATTENDANCE.RAGU
  const guests = attendance === ATTENDANCE.HADIR ? Number(values.guests) || 1 : 0
  return {
    name: sanitizeText(values.name, config.nameMaxLength),
    attendance,
    guests: Math.min(Math.max(guests, 0), config.maxGuests),
    message: sanitizeText(values.message, config.messageMaxLength),
  }
}

/** Normalisasi data yang datang dari backend/demo agar aman dirender. */
export function normalizeWish(row) {
  if (!row || typeof row !== 'object') return null
  const id = row.id ?? `local-${row.created_at ?? Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const attendance = Object.values(ATTENDANCE).includes(row.attendance) ? row.attendance : ATTENDANCE.RAGU
  return {
    id: String(id),
    name: sanitizeText(row.name, 80) || 'Tamu Undangan',
    attendance,
    guests: Number.isFinite(Number(row.guests)) ? Math.max(0, Number(row.guests)) : 0,
    message: String(row.message ?? '').slice(0, 1000),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  }
}
