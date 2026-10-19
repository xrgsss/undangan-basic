import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon'
import { useToast } from './Toast'
import { copyText, groupDigits } from '../lib/utils'

/* ============================================================================
 *  CopyField — baris data (rekening / alamat) dengan tombol salin + notifikasi.
 * ========================================================================== */
export default function CopyField({
  label,
  value,
  displayValue,
  group = false,
  copyLabel = 'Salin',
  copiedLabel = 'Tersalin',
  toastMessage = 'Berhasil disalin',
  hint,
  className = '',
  monospace = true,
}) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const { showToast } = useToast()

  const shown = displayValue ?? (group ? groupDigits(value) : value)

  const handleCopy = async () => {
    const ok = await copyText(value)
    if (ok) {
      setCopied(true)
      setFailed(false)
      showToast(toastMessage, { tone: 'success', icon: 'check' })
      window.setTimeout(() => setCopied(false), 2200)
    } else {
      setFailed(true)
      showToast('Gagal menyalin otomatis. Silakan salin manual.', { tone: 'error', icon: 'error' })
      window.setTimeout(() => setFailed(false), 2600)
    }
  }

  return (
    <div className={className}>
      {label ? (
        <p className="font-sans text-[9px] font-bold uppercase tracking-[0.26em] text-cocoa-300">{label}</p>
      ) : null}

      <div className="mt-1.5 flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center rounded-xl border border-champagne/25 bg-white/70 px-3 py-2.5">
          <span
            className={`truncate text-[13px] tracking-wide text-cocoa-600 sm:text-sm ${
              monospace ? 'font-mono tabular-nums' : ''
            }`}
            title={String(value)}
          >
            {shown}
          </span>
        </div>

        <motion.button
          type="button"
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
          className={`group inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 ${
            copied
              ? 'border-olive/45 bg-[#f4f6ec] text-olive-700'
              : failed
                ? 'border-[#b3766a]/45 bg-[#fdf5f2] text-[#a95c4d]'
                : 'border-champagne/40 bg-ivory-50 text-champagne-700 hover:bg-white'
          }`}
          aria-label={`${copyLabel} ${label || 'nilai'}`}
          title={`${copyLabel} ${label || ''}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? 'copied' : 'idle'}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="grid place-items-center"
            >
              <Icon name={copied ? 'check' : 'copy'} size={14} />
            </motion.span>
          </AnimatePresence>
          <span className="hidden sm:inline">{copied ? copiedLabel : copyLabel}</span>
        </motion.button>
      </div>

      {hint ? <p className="mt-1.5 text-[11px] leading-relaxed text-cocoa-300">{hint}</p> : null}
    </div>
  )
}
