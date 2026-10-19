/* ============================================================================
 *  supabaseClient.js
 * ----------------------------------------------------------------------------
 *  Klien Supabase dibuat SECARA OPSIONAL dan LAZY (dynamic import):
 *  • Bila VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY kosong, fungsi ini
 *    mengembalikan null tanpa mengunduh library apa pun.
 *  • Library @supabase/supabase-js hanya masuk ke bundle terpisah dan baru
 *    dimuat saat benar-benar dipakai.
 * ========================================================================== */

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const url = typeof rawUrl === 'string' ? rawUrl.trim() : ''
const anonKey = typeof rawKey === 'string' ? rawKey.trim() : ''

/** True bila kredensial Supabase tersedia dan terlihat valid. */
export const isSupabaseConfigured = Boolean(url && anonKey && /^https?:\/\//i.test(url))

/** Nama tabel penyimpanan RSVP (sesuaikan dengan supabase/schema.sql). */
export const RSVP_TABLE = 'rsvp_wishes'

let clientPromise = null

/**
 * Ambil klien Supabase (memoized).
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient|null>}
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { 'x-application-name': 'undangan-digital' } },
        }),
      )
      .catch((error) => {
        console.error('[supabase] gagal memuat klien:', error)
        return null
      })
  }
  return clientPromise
}

export default getSupabaseClient
