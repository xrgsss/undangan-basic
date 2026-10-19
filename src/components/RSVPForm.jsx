import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from './Button'
import Icon from './Icon'
import { weddingConfig } from '../data/weddingConfig'
import { ATTENDANCE, ATTENDANCE_OPTIONS, createInitialValues, validateRsvp } from '../lib/validation'
import { cn, formatDateLong } from '../lib/utils'

/* ============================================================================
 *  RSVPForm — formulir konfirmasi kehadiran & ucapan.
 *  • Validasi ganda: di sini (langsung) dan di rsvpService (lapisan server).
 *  • Anti-spam: honeypot tersembunyi + batas waktu pengisian minimum.
 *  • Loading state, pesan sukses/gagal, dan label untuk pembaca layar.
 * ========================================================================== */
export default function RSVPForm({ defaultName = '', submitting = false, onSubmit, className = '' }) {
  const config = weddingConfig.rsvp
  const formId = useId().replace(/:/g, '')
  const [values, setValues] = useState(() => createInitialValues(defaultName))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | success | error
  const [feedback, setFeedback] = useState('')
  const mountedAt = useRef(Date.now())
  const honeypotRef = useRef(null)
  const nameRef = useRef(null)

  // Isi otomatis nama tamu dari URL, tetapi jangan menimpa ketikan pengguna.
  useEffect(() => {
    if (!defaultName) return
    setValues((prev) => (prev.name ? prev : { ...prev, name: defaultName }))
  }, [defaultName])

  const deadlineLabel = useMemo(() => formatDateLong(weddingConfig.event.rsvpDeadlineISO), [])
  const remaining = config.messageMaxLength - values.message.length

  const update = (patch) => {
    setValues((prev) => ({ ...prev, ...patch }))
    setStatus('idle')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const { valid, errors: validationErrors } = validateRsvp(values, config)
    if (!valid) {
      setErrors(validationErrors)
      setStatus('error')
      setFeedback('Mohon periksa kembali data yang belum lengkap.')
      const firstKey = Object.keys(validationErrors)[0]
      if (firstKey === 'name') nameRef.current?.focus()
      else document.getElementById(`${formId}-${firstKey}`)?.focus()
      return
    }

    setErrors({})
    setStatus('idle')
    setFeedback('')

    const result = await onSubmit?.(values, {
      honeypot: honeypotRef.current?.value ?? '',
      elapsedMs: Date.now() - mountedAt.current,
    })

    if (result?.error) {
      setErrors(result.fieldErrors ?? {})
      setStatus('error')
      setFeedback(result.error.message || 'Ucapan gagal dikirim. Silakan coba lagi.')
      return
    }

    setStatus('success')
    setFeedback(config.successMessage)
    setValues((prev) => ({ ...createInitialValues(), name: prev.name }))
    mountedAt.current = Date.now()
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('paper-card relative overflow-hidden rounded-3xl px-5 py-6 sm:px-7 sm:py-8', className)}
      aria-describedby={`${formId}-note`}
    >
      <span className="absolute inset-x-8 top-0 h-px gold-rule" aria-hidden="true" />

      <div className="text-center">
        <p className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-champagne-600">Formulir RSVP</p>
        <h3 className="mt-2 font-display text-xl text-cocoa sm:text-2xl">Konfirmasi Kehadiran</h3>
        {deadlineLabel ? (
          <p className="mt-2 font-serif text-[13px] italic text-cocoa-400">
            Mohon konfirmasi sebelum {deadlineLabel}
          </p>
        ) : null}
      </div>

      {/* Honeypot — tersembunyi dari manusia, sering diisi bot. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor={`${formId}-website`}>Website (jangan diisi)</label>
        <input id={`${formId}-website`} ref={honeypotRef} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 space-y-5">
        {/* Nama */}
        <div>
          <label htmlFor={`${formId}-name`} className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-cocoa-400">
            Nama Anda <span className="text-champagne-600">*</span>
          </label>
          <input
            id={`${formId}-name`}
            ref={nameRef}
            name="name"
            type="text"
            autoComplete="name"
            className="input-elegant mt-2"
            placeholder="Nama lengkap atau keluarga"
            maxLength={config.nameMaxLength}
            value={values.name}
            onChange={(event) => update({ name: event.target.value })}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            required
          />
          {errors.name ? (
            <p id={`${formId}-name-error`} className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#a95c4d]">
              <Icon name="error" size={12} />
              {errors.name}
            </p>
          ) : null}
        </div>

        {/* Kehadiran */}
        <fieldset>
          <legend className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-cocoa-400">
            Konfirmasi Kehadiran <span className="text-champagne-600">*</span>
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {ATTENDANCE_OPTIONS.map((option) => {
              const checked = values.attendance === option.value
              return (
                <label key={option.value} className="relative cursor-pointer">
                  <input
                    id={`${formId}-attendance-${option.value}`}
                    type="radio"
                    name="attendance"
                    value={option.value}
                    checked={checked}
                    onChange={() => update({ attendance: option.value, guests: option.value === ATTENDANCE.HADIR ? Math.max(1, values.guests) : 0 })}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-full flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-center transition-colors duration-300',
                      'peer-focus-visible:ring-2 peer-focus-visible:ring-champagne/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ivory',
                      checked
                        ? 'border-champagne/70 bg-champagne/12 text-champagne-700 shadow-soft'
                        : 'border-champagne/25 bg-white/60 text-cocoa-400 hover:border-champagne/45',
                    )}
                  >
                    <Icon
                      name={option.value === ATTENDANCE.HADIR ? 'check' : option.value === ATTENDANCE.TIDAK_HADIR ? 'ban' : 'info'}
                      size={16}
                    />
                    <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em]">{option.label}</span>
                    <span className="text-[10px] leading-snug text-cocoa-300">{option.hint}</span>
                  </span>
                </label>
              )
            })}
          </div>
          {errors.attendance ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#a95c4d]">
              <Icon name="error" size={12} />
              {errors.attendance}
            </p>
          ) : null}
        </fieldset>

        {/* Jumlah tamu (hanya bila hadir) */}
        <AnimatePresence initial={false}>
          {values.attendance === ATTENDANCE.HADIR ? (
            <motion.div
              key="guests"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <label htmlFor={`${formId}-guests`} className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-cocoa-400">
                Jumlah Tamu yang Hadir
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id={`${formId}-guests`}
                  name="guests"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={config.maxGuests}
                  step="1"
                  className="input-elegant max-w-[7rem] text-center"
                  value={values.guests}
                  onChange={(event) => update({ guests: Number(event.target.value) })}
                  aria-invalid={Boolean(errors.guests) || undefined}
                  aria-describedby={`${formId}-guests-hint`}
                />
                <p id={`${formId}-guests-hint`} className="text-[11px] leading-relaxed text-cocoa-300">
                  Termasuk Anda sendiri, maksimal {config.maxGuests} orang.
                </p>
              </div>
              {errors.guests ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#a95c4d]">
                  <Icon name="error" size={12} />
                  {errors.guests}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Ucapan */}
        <div>
          <label htmlFor={`${formId}-message`} className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-cocoa-400">
            Ucapan &amp; Doa <span className="text-champagne-600">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={4}
            className="input-elegant mt-2 resize-y leading-relaxed"
            placeholder="Tuliskan doa dan ucapan terbaik Anda untuk kedua mempelai…"
            maxLength={config.messageMaxLength}
            value={values.message}
            onChange={(event) => update({ message: event.target.value })}
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={`${formId}-message-help`}
            required
          />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            {errors.message ? (
              <p className="flex items-center gap-1.5 text-[11px] text-[#a95c4d]">
                <Icon name="error" size={12} />
                {errors.message}
              </p>
            ) : (
              <span id={`${formId}-message-help`} className="text-[11px] text-cocoa-300">
                Maksimal {config.messageMaxLength} karakter.
              </span>
            )}
            <span
              className={cn('text-[11px] tabular-nums', remaining < 40 ? 'text-champagne-700' : 'text-cocoa-300')}
              aria-live="polite"
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* Pesan status */}
        <AnimatePresence>
          {feedback ? (
            <motion.div
              key={status + feedback}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              role={status === 'error' ? 'alert' : 'status'}
              className={cn(
                'flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[12px] leading-relaxed',
                status === 'error'
                  ? 'border-[#b3766a]/40 bg-[#fdf5f2] text-[#a95c4d]'
                  : 'border-olive/40 bg-[#f4f6ec] text-olive-700',
              )}
            >
              <Icon name={status === 'error' ? 'error' : 'check'} size={15} className="mt-0.5 shrink-0" />
              <span>{feedback}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          icon={submitting ? undefined : 'send'}
          loading={submitting}
          disabled={submitting}
          fullWidth
        >
          {submitting ? 'Mengirim…' : 'Kirim Ucapan'}
        </Button>

        <p id={`${formId}-note`} className="text-center text-[10px] leading-relaxed text-cocoa-300">
          Data Anda hanya digunakan untuk keperluan konfirmasi acara pernikahan.
        </p>
      </div>
    </form>
  )
}
