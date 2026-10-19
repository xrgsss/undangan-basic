import { weddingConfig } from '../data/weddingConfig'
import { normalizeWish, toWishPayload, validateRsvp } from '../lib/validation'
import { getSupabaseClient, isSupabaseConfigured, RSVP_TABLE } from './supabaseClient'

/* ============================================================================
 *  rsvpService — satu-satunya pintu masuk data RSVP & ucapan.
 *
 *  Dua mode yang JELAS dan tidak saling menyamar:
 *   • 'supabase' → data dikirim ke tabel `rsvp_wishes` (butuh .env terisi dan
 *     skema dari supabase/schema.sql sudah dijalankan).
 *   • 'demo'     → data disimpan di localStorage browser. UI menampilkan
 *     banner "Mode Demo" dan ucapan contoh supaya tidak menyesatkan.
 *
 *  Semua fungsi mengembalikan objek { data, error } dan tidak pernah melempar
 *  exception — sehingga komponen tidak perlu try/catch berlapis.
 * ========================================================================== */

const STORAGE_KEY = 'undangan:rsvp:wishes:v1'
const LAST_SUBMIT_KEY = 'undangan:rsvp:last-submit'
const MAX_LOCAL_WISHES = 200
// Jeda minimum antar-pengiriman pada MODE DEMO (meniru pembatas spam server).
const DEMO_RATE_LIMIT_MS = 10_000

const CONFIG = weddingConfig.rsvp

/** Tentukan mode aktif berdasarkan konfigurasi + ketersediaan kredensial. */
function resolveProvider() {
  const requested = CONFIG.provider || 'auto'
  if (requested === 'demo') return 'demo'
  if (requested === 'supabase') return isSupabaseConfigured ? 'supabase' : 'demo'
  return isSupabaseConfigured ? 'supabase' : 'demo'
}

export const activeProvider = resolveProvider()
export const isDemoMode = activeProvider === 'demo'

/* -------------------------------------------------------------------------- */
/*  Util penyimpanan lokal (aman untuk mode private / storage diblokir)        */
/* -------------------------------------------------------------------------- */

function readLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeLocal(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_LOCAL_WISHES)))
    return true
  } catch {
    return false
  }
}

/** Ucapan contoh untuk mode demo — ditandai jelas sebagai contoh. */
function createSampleWishes() {
  const now = Date.now()
  return [
    {
      id: 'sample-3',
      name: 'Rizky & Ayu',
      attendance: 'hadir',
      guests: 2,
      message:
        'Barakallahu lakuma wa baraka alaikuma wa jama’a bainakuma fii khairin. Selamat menempuh hidup baru, Diana & Hengki!',
      createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: 'sample-2',
      name: 'Keluarga Hartono',
      attendance: 'hadir',
      guests: 4,
      message: 'Selamat menikah. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Sampai jumpa di hari H!',
      createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: 'sample-1',
      name: 'Teman Kerja Diana',
      attendance: 'ragu',
      guests: 1,
      message: 'Turut berbahagia! Semoga dilancarkan sampai hari H, kami usahakan hadir.',
      createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
  ]
}

/** Bersihkan data contoh begitu tamu mengirim ucapan pertamanya sendiri. */
function stripSamples(list) {
  return list.filter((item) => !item.isSample)
}

/* -------------------------------------------------------------------------- */
/*  API publik                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Ambil daftar ucapan, terbaru lebih dahulu.
 * @param {{ limit?: number, offset?: number }} options
 */
export async function fetchWishes({ limit = 60, offset = 0 } = {}) {
  if (activeProvider === 'supabase') {
    const client = await getSupabaseClient()
    if (!client) {
      return { data: [], error: { message: 'Klien Supabase tidak tersedia.' }, provider: 'supabase' }
    }
    const { data, error } = await client
      .from(RSVP_TABLE)
      .select('id, name, attendance, guests, message, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[rsvp] gagal memuat ucapan:', error)
      return { data: [], error: { message: 'Gagal memuat ucapan dari server.' }, provider: 'supabase' }
    }
    return { data: (data ?? []).map(normalizeWish).filter(Boolean), error: null, provider: 'supabase' }
  }

  // Mode demo
  let list = readLocal()
  if (!list) {
    list = createSampleWishes()
    writeLocal(list)
  }
  const normalized = list.map(normalizeWish).filter(Boolean)
  return {
    data: normalized.slice(offset, offset + limit),
    error: null,
    provider: 'demo',
  }
}

/** Hitung total ucapan (dipakai untuk badge jumlah ucapan). */
export async function countWishes() {
  if (activeProvider === 'supabase') {
    const client = await getSupabaseClient()
    if (!client) return { count: 0, error: { message: 'Klien Supabase tidak tersedia.' } }
    const { count, error } = await client.from(RSVP_TABLE).select('id', { count: 'exact', head: true })
    if (error) return { count: 0, error: { message: 'Gagal menghitung ucapan.' } }
    return { count: count ?? 0, error: null }
  }
  const list = readLocal() ?? []
  return { count: list.length, error: null }
}

/**
 * Kirim ucapan / konfirmasi kehadiran.
 * Validasi dijalankan ulang di sini (lapisan "server" untuk mode demo) supaya
 * komponen tidak bisa mengirim data yang tidak valid.
 * @param {object} values nilai formulir mentah
 * @param {{ honeypot?: string, elapsedMs?: number }} meta anti-spam
 */
export async function submitWish(values, meta = {}) {
  const { honeypot = '', elapsedMs = Number.POSITIVE_INFINITY } = meta ?? {}

  // 1) Anti-spam ringan: honeypot terisi = bot.
  if (String(honeypot).trim() !== '') {
    return { data: null, error: { message: 'Pengiriman ditolak.' }, fieldErrors: {} }
  }

  // 2) Anti-spam: formulir terisi terlalu cepat.
  const minMs = (CONFIG.minFillSeconds || 0) * 1000
  if (Number.isFinite(elapsedMs) && elapsedMs < minMs) {
    return {
      data: null,
      error: { message: 'Pengiriman terlalu cepat. Mohon periksa kembali ucapan Anda.' },
      fieldErrors: {},
    }
  }

  // 3) Validasi ulang (lapisan kedua setelah validasi di form).
  const { valid, errors } = validateRsvp(values, CONFIG)
  if (!valid) {
    return {
      data: null,
      error: { message: 'Data belum lengkap atau tidak valid.' },
      fieldErrors: errors,
    }
  }

  const payload = toWishPayload(values, CONFIG)

  if (activeProvider === 'supabase') {
    const client = await getSupabaseClient()
    if (!client) {
      return { data: null, error: { message: 'Klien Supabase tidak tersedia.' }, fieldErrors: {} }
    }
    const { data, error } = await client.from(RSVP_TABLE).insert(payload).select().single()
    if (error) {
      console.error('[rsvp] gagal menyimpan ucapan:', error)
      const isRateLimited = error.code === 'PT429' || /rate limit/i.test(error.message || '')
      return {
        data: null,
        error: {
          message: isRateLimited
            ? 'Terlalu banyak pengiriman. Mohon coba lagi beberapa saat lagi.'
            : 'Ucapan gagal dikirim. Silakan coba lagi.',
        },
        fieldErrors: {},
      }
    }
    return { data: normalizeWish(data), error: null, fieldErrors: {} }
  }

  // Mode demo: batasi pengiriman beruntun agar perilakunya mirip server asli.
  try {
    const last = Number(window.localStorage.getItem(LAST_SUBMIT_KEY) || 0)
    if (last && Date.now() - last < DEMO_RATE_LIMIT_MS) {
      const wait = Math.ceil((DEMO_RATE_LIMIT_MS - (Date.now() - last)) / 1000)
      return {
        data: null,
        error: { message: `Mohon tunggu ${wait} detik sebelum mengirim ucapan lagi (mode demo).` },
        fieldErrors: {},
      }
    }
  } catch {
    /* abaikan */
  }

  const entry = normalizeWish({
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...payload,
    created_at: new Date().toISOString(),
  })

  const existing = stripSamples(readLocal() ?? [])
  const next = [entry, ...existing]
  const saved = writeLocal(next)
  try {
    window.localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()))
  } catch {
    /* abaikan */
  }

  if (!saved) {
    return {
      data: null,
      error: { message: 'Penyimpanan browser tidak tersedia. Ucapan tidak tersimpan.' },
      fieldErrors: {},
    }
  }

  return { data: entry, error: null, fieldErrors: {} }
}

/**
 * Berlangganan ucapan baru.
 *  • Supabase → realtime channel (butuh Realtime diaktifkan untuk tabel).
 *  • Demo     → event `storage` (sinkron antar-tab di browser yang sama).
 * @returns {() => void} fungsi unsubscribe
 */
export function subscribeWishes(onInsert) {
  if (activeProvider === 'supabase') {
    let channel = null
    let cancelled = false
    getSupabaseClient()
      .then((client) => {
        if (!client || cancelled) return
        channel = client
          .channel('rsvp-wishes-stream')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: RSVP_TABLE }, (payload) => {
            const wish = normalizeWish(payload.new)
            if (wish) onInsert(wish)
          })
          .subscribe()
      })
      .catch(() => {
        /* realtime opsional — abaikan bila gagal */
      })
    return () => {
      cancelled = true
      if (channel) channel.unsubscribe()
    }
  }

  const handler = (event) => {
    if (event.key !== STORAGE_KEY) return
    const list = readLocal()
    if (list?.[0]) {
      const wish = normalizeWish(list[0])
      if (wish) onInsert(wish)
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

/** Ringkasan statistik dari daftar yang sudah dimuat. */
export function summarizeWishes(wishes = []) {
  const total = wishes.length
  const attending = wishes.filter((w) => w.attendance === 'hadir')
  const guests = attending.reduce((sum, w) => sum + (w.guests || 1), 0)
  return {
    total,
    attendingCount: attending.length,
    absentCount: wishes.filter((w) => w.attendance === 'tidak_hadir').length,
    unsureCount: wishes.filter((w) => w.attendance === 'ragu').length,
    guestEstimate: guests,
  }
}

export default { fetchWishes, submitWish, subscribeWishes, countWishes, summarizeWishes, activeProvider, isDemoMode }
