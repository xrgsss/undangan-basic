import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Icon from './Icon'
import { cn } from '../lib/utils'

/* ============================================================================
 *  Toast — notifikasi ringan (mis. "Nomor berhasil disalin").
 *  Dibuat sebagai context agar dapat dipanggil dari komponen mana pun.
 * ========================================================================== */

const ToastContext = createContext(null)

const TONES = {
  success: { border: 'border-olive/40', icon: 'check', iconClass: 'text-olive', bg: 'bg-[#f6f7f1]' },
  error: { border: 'border-[#b3766a]/40', icon: 'error', iconClass: 'text-[#a95c4d]', bg: 'bg-[#fdf5f2]' },
  info: { border: 'border-champagne/45', icon: 'info', iconClass: 'text-champagne-600', bg: 'bg-ivory-50' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, { tone = 'success', duration = 3200, icon } = {}) => {
      if (!message) return null
      counter.current += 1
      const id = `toast-${counter.current}`
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, icon }])
      const timer = window.setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const timersMap = timers.current
    return () => {
      timersMap.forEach((timer) => window.clearTimeout(timer))
      timersMap.clear()
    }
  }, [])

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({ toasts, onDismiss }) {
  const reduce = useReducedMotion()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex flex-col items-center gap-2 px-4 safe-top"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] ?? TONES.info
          return (
            <motion.div
              key={toast.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-card backdrop-blur',
                tone.border,
                tone.bg,
              )}
            >
              <Icon name={toast.icon ?? tone.icon} size={18} className={cn('mt-0.5 shrink-0', tone.iconClass)} />
              <p className="flex-1 text-[13px] leading-relaxed text-cocoa-600">{toast.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="-mr-1 shrink-0 rounded-full p-1 text-cocoa-300 transition-colors hover:bg-champagne/10 hover:text-cocoa"
                aria-label="Tutup notifikasi"
              >
                <Icon name="close" size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback aman bila provider belum terpasang (tidak membuat aplikasi crash).
    return { showToast: () => null, dismiss: () => null }
  }
  return context
}

export default ToastProvider
