import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import Button from './Button'
import { ATTENDANCE, ATTENDANCE_LABEL } from '../lib/validation'
import { cn, formatRelative } from '../lib/utils'

/* ============================================================================
 *  WishesList — daftar ucapan tamu (terbaru lebih dahulu).
 *  Menangani semua keadaan: memuat, kosong, gagal, dan berisi data.
 * ========================================================================== */

const BADGE_STYLES = {
  [ATTENDANCE.HADIR]: 'border-olive/40 bg-[#f4f6ec] text-olive-700',
  [ATTENDANCE.TIDAK_HADIR]: 'border-[#b3766a]/35 bg-[#fdf5f2] text-[#a95c4d]',
  [ATTENDANCE.RAGU]: 'border-champagne/45 bg-champagne/10 text-champagne-700',
}

function initialOf(name) {
  return (name || '?').trim().charAt(0).toUpperCase()
}

export default function WishesList({ wishes = [], loading = false, error = null, onRetry, hasMore = false, onLoadMore, className = '' }) {
  const reduce = useReducedMotion()

  if (loading && wishes.length === 0) {
    return (
      <div className={cn('space-y-3', className)} aria-busy="true" aria-live="polite">
        {[0, 1, 2].map((index) => (
          <div key={index} className="paper-card rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-champagne/15" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded-full bg-champagne/15" />
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-champagne/10" />
              </div>
            </div>
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-champagne/10" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-champagne/10" />
          </div>
        ))}
        <p className="sr-only">Memuat ucapan tamu…</p>
      </div>
    )
  }

  if (error && wishes.length === 0) {
    return (
      <div className={cn('paper-card rounded-2xl px-5 py-6 text-center', className)} role="alert">
        <Icon name="error" size={22} className="mx-auto text-[#a95c4d]" />
        <p className="mt-3 text-sm text-cocoa-400">{error.message || 'Ucapan gagal dimuat.'}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" icon="arrowRight" className="mt-4" onClick={onRetry}>
            Coba Lagi
          </Button>
        ) : null}
      </div>
    )
  }

  if (wishes.length === 0) {
    return (
      <div className={cn('paper-card rounded-2xl px-5 py-8 text-center', className)}>
        <Icon name="message" size={24} className="mx-auto text-champagne-600" />
        <p className="mt-3 font-display text-lg text-cocoa">Belum ada ucapan</p>
        <p className="mt-1.5 text-[13px] text-cocoa-400">Jadilah yang pertama mengirimkan doa terbaik Anda.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {wishes.map((wish, index) => (
            <motion.li
              key={wish.id}
              layout={reduce ? false : 'position'}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : Math.min(index, 5) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="paper-card rounded-2xl px-4 py-4 sm:px-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-champagne/40 bg-[radial-gradient(circle_at_35%_30%,#fffdf8,#f0e7d5)] font-display text-sm text-champagne-700"
                  aria-hidden="true"
                >
                  {initialOf(wish.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate font-display text-[15px] text-cocoa" title={wish.name}>
                      {wish.name}
                    </p>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-[2px] font-sans text-[9px] font-bold uppercase tracking-[0.12em]',
                        BADGE_STYLES[wish.attendance] ?? BADGE_STYLES[ATTENDANCE.RAGU],
                      )}
                    >
                      {ATTENDANCE_LABEL[wish.attendance] ?? 'Masih Ragu'}
                      {wish.attendance === ATTENDANCE.HADIR && wish.guests > 1 ? ` · ${wish.guests}` : ''}
                    </span>
                    {wish.isSample ? (
                      <span className="inline-flex items-center rounded-full border border-dashed border-cocoa-300/50 px-2 py-[2px] font-sans text-[9px] uppercase tracking-[0.12em] text-cocoa-300">
                        Contoh
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 whitespace-pre-line break-words text-[13px] leading-relaxed text-cocoa-600 sm:text-sm">
                    {wish.message}
                  </p>

                  <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-300">
                    {formatRelative(wish.createdAt)}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" loading={loading} onClick={onLoadMore}>
            {loading ? 'Memuat…' : 'Tampilkan Ucapan Lainnya'}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-center text-[11px] text-[#a95c4d]" role="status">
          {error.message}
        </p>
      ) : null}
    </div>
  )
}
