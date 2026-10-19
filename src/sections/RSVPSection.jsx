import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { weddingConfig } from '../data/weddingConfig'
import { activeProvider, fetchWishes, isDemoMode, submitWish, subscribeWishes, summarizeWishes } from '../services/rsvpService'
import { formatDateLong } from '../lib/utils'
import Icon from '../components/Icon'
import RSVPForm from '../components/RSVPForm'
import SectionShell from '../components/SectionShell'
import SectionHeading from '../components/SectionHeading'
import WishesList from '../components/WishesList'
import { Reveal } from '../components/Motion'

/* ============================================================================
 *  RSVPSection — formulir konfirmasi kehadiran + daftar ucapan tamu.
 *
 *  Lapisan data ada di src/services/rsvpService.js:
 *   • Mode Supabase : data tersimpan di tabel `rsvp_wishes` (online).
 *   • Mode Demo     : data tersimpan di localStorage browser + banner jelas.
 * ========================================================================== */
const PAGE_SIZE = 20

export default function RSVPSection({ guestName }) {
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const offsetRef = useRef(0)

  const appendUnique = useCallback((incoming) => {
    setWishes((prev) => {
      const map = new Map(prev.map((wish) => [wish.id, wish]))
      for (const wish of incoming) {
        if (wish?.id && !map.has(wish.id)) map.set(wish.id, wish)
      }
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
  }, [])

  const load = useCallback(
    async ({ reset = false } = {}) => {
      setLoading(true)
      setError(null)
      const offset = reset ? 0 : offsetRef.current
      const result = await fetchWishes({ limit: PAGE_SIZE, offset })
      if (result.error) {
        setError(result.error)
      } else {
        if (reset) setWishes(result.data)
        else appendUnique(result.data)
        offsetRef.current = offset + result.data.length
        setHasMore(result.data.length === PAGE_SIZE)
      }
      setLoading(false)
    },
    [appendUnique],
  )

  useEffect(() => {
    let active = true
    load({ reset: true })

    // Ucapan baru dari tamu lain (Supabase Realtime / sinkron antar-tab).
    const unsubscribe = subscribeWishes((wish) => {
      if (!active) return
      appendUnique([wish])
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [appendUnique, load])

  const handleSubmit = async (values, meta) => {
    setSubmitting(true)
    try {
      const result = await submitWish(values, meta)
      if (!result.error && result.data) {
        appendUnique([result.data])
      }
      return result
    } catch (unexpected) {
      console.error('[rsvp] kesalahan tak terduga:', unexpected)
      return { data: null, error: { message: 'Terjadi kesalahan tak terduga. Silakan coba lagi.' }, fieldErrors: {} }
    } finally {
      setSubmitting(false)
    }
  }

  const stats = useMemo(() => summarizeWishes(wishes), [wishes])
  const deadlineLabel = formatDateLong(weddingConfig.event.rsvpDeadlineISO)

  return (
    <SectionShell id="rsvp" labelledBy="rsvp-title">
      <SectionHeading
        eyebrow="Konfirmasi"
        title={weddingConfig.rsvp.title}
        subtitle={weddingConfig.rsvp.subtitle}
        titleId="rsvp-title"
      />

      <Reveal delay={0.1} className="mt-6">
        <p className="mx-auto max-w-2xl text-center text-[13px] leading-relaxed text-cocoa-400 sm:text-sm">
          {weddingConfig.rsvp.intro}
          {deadlineLabel ? (
            <>
              {' '}
              Batas konfirmasi: <span className="font-display text-cocoa">{deadlineLabel}</span>.
            </>
          ) : null}
        </p>
      </Reveal>

      {/* Ringkasan kehadiran */}
      <Reveal delay={0.14} className="mt-8">
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
          {[
            { label: 'Ucapan', value: stats.total, icon: 'message' },
            { label: 'Hadir', value: stats.attendingCount, icon: 'check' },
            { label: 'Perkiraan Tamu', value: stats.guestEstimate, icon: 'users' },
          ].map((item) => (
            <div key={item.label} className="paper-card rounded-2xl px-3 py-4 text-center">
              <Icon name={item.icon} size={15} className="mx-auto text-champagne-600" />
              <p className="mt-2 font-display text-2xl leading-none text-cocoa tabular-nums">{item.value}</p>
              <p className="mt-1.5 font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-cocoa-300">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Pemberitahuan mode penyimpanan — jujur, tidak menyamar sebagai backend */}
      {isDemoMode ? (
        <Reveal delay={0.18} className="mt-6">
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-dashed border-champagne/50 bg-ivory-50/80 px-4 py-3.5">
            <Icon name="info" size={16} className="mt-0.5 shrink-0 text-champagne-700" />
            <div className="text-[12px] leading-relaxed text-cocoa-400">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-700">
                Mode Demo Aktif
              </p>
              <p className="mt-1.5">
                Ucapan saat ini disimpan <strong className="font-normal text-cocoa">hanya di browser ini</strong> (localStorage)
                dan tidak terlihat oleh tamu lain. Untuk menyimpan ucapan secara online, isi{' '}
                <code className="font-mono text-[11px]">.env</code> dengan kredensial Supabase dan jalankan{' '}
                <code className="font-mono text-[11px]">supabase/schema.sql</code>. Panduan lengkap ada di README.md.
              </p>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={0.18} className="mt-6">
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-olive/35 bg-[#f4f6ec] px-4 py-3">
            <Icon name="check" size={16} className="shrink-0 text-olive-700" />
            <p className="text-[12px] leading-relaxed text-olive-700">
              Terhubung ke Supabase (<span className="font-mono text-[11px]">{activeProvider}</span>). Ucapan Anda tersimpan
              secara online dan dapat dilihat seluruh tamu.
            </p>
          </div>
        </Reveal>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <Reveal y={30}>
          <RSVPForm defaultName={guestName === weddingConfig.meta.defaultGuest ? '' : guestName} submitting={submitting} onSubmit={handleSubmit} />
        </Reveal>

        <div>
          <motion.div
            className="mb-4 flex items-center justify-between gap-3"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display text-xl text-cocoa">Ucapan &amp; Doa</h3>
            <span className="rounded-full border border-champagne/30 bg-white/60 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-champagne-700">
              {stats.total} ucapan
            </span>
          </motion.div>

          <WishesList
            wishes={wishes}
            loading={loading}
            error={error}
            hasMore={hasMore && !loading}
            onLoadMore={() => load({ reset: false })}
            onRetry={() => load({ reset: true })}
          />
        </div>
      </div>
    </SectionShell>
  )
}
