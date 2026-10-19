import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import useCountdown from '../hooks/useCountdown'
import { formatDateLong, pad } from '../lib/utils'
import Icon from './Icon'
import { cn } from '../lib/utils'

/* ============================================================================
 *  Countdown — hitung mundur menuju hari pernikahan.
 *  • Angka berubah dengan transisi naik/turun yang halus.
 *  • Lebar digit dikunci (tabular-nums + lebar ch) supaya tidak ada layout
 *    yang bergeser saat angka berganti.
 *  • Bila acara sudah lewat, tampil pesan khusus alih-alih angka nol.
 * ========================================================================== */

function AnimatedNumber({ value, className }) {
  const reduce = useReducedMotion()
  const display = pad(value)

  if (reduce) {
    return <span className={cn('inline-block tabular-nums', className)}>{display}</span>
  }

  return (
    <span className={cn('relative inline-flex h-[1.15em] w-[2.1ch] items-center justify-center overflow-hidden', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={{ y: '-70%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '70%', opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inline-block tabular-nums"
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Countdown({ targetISO, className, label = 'Menuju hari bahagia' }) {
  const { parts, isValid, isComplete } = useCountdown(targetISO)

  if (!isValid) {
    return (
      <div className={cn('paper-card rounded-2xl px-5 py-6 text-center', className)}>
        <p className="flex items-center justify-center gap-2 text-sm text-cocoa-400">
          <Icon name="info" size={16} className="text-champagne-600" />
          Tanggal acara belum diatur pada <code className="font-mono text-xs">weddingConfig.js</code>.
        </p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className={cn('paper-card rounded-2xl px-6 py-8 text-center', className)}>
        <Icon name="heartHandshake" size={28} className="mx-auto text-champagne-600" />
        <p className="mt-3 font-display text-xl text-cocoa sm:text-2xl">Alhamdulillah, acara telah berlangsung</p>
        <p className="mt-2 font-serif text-sm italic text-cocoa-400">
          Terima kasih atas doa dan kehadiran Anda pada hari bahagia kami.
        </p>
      </div>
    )
  }

  const readable = formatDateLong(targetISO)

  return (
    <div className={cn('', className)}>
      <p className="mb-4 text-center font-sans text-[10px] font-bold uppercase tracking-[0.36em] text-champagne-600">
        {label}
      </p>

      <div
        className="grid grid-cols-4 gap-2 sm:gap-3"
        role="timer"
        aria-live="off"
        aria-label={readable ? `Hitung mundur menuju ${readable}` : 'Hitung mundur acara'}
      >
        {parts.map((part, index) => (
          <motion.div
            key={part.key}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="paper-card relative overflow-hidden rounded-2xl px-1 py-3.5 text-center sm:py-5"
          >
            <span className="absolute inset-x-0 top-0 h-px gold-rule opacity-80" aria-hidden="true" />
            <span className="flex items-center justify-center font-display text-2xl leading-none text-gilded sm:text-3xl lg:text-4xl">
              <AnimatedNumber value={part.value} />
            </span>
            <span className="mt-2 block font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-cocoa-400 sm:text-[10px] sm:tracking-[0.3em]">
              {part.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
