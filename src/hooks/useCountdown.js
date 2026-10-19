import { useEffect, useMemo, useState } from 'react'
import { isValidDateISO } from '../lib/utils'

/* ============================================================================
 *  useCountdown — hitung mundur akurat menuju tanggal acara.
 *  • Menghitung ulang dari Date.now() setiap detik (tidak "melenceng").
 *  • Interval disinkronkan ke pergantian detik agar angka tidak pincang.
 *  • Mengembalikan status khusus bila acara sudah berlangsung / data invalid.
 * ========================================================================== */
export function useCountdown(targetISO) {
  const isValid = isValidDateISO(targetISO)
  const target = useMemo(() => (isValid ? new Date(targetISO).getTime() : null), [isValid, targetISO])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!isValid || target === null) return undefined
    let timer = null
    let cancelled = false

    const schedule = () => {
      if (cancelled) return
      const delay = 1000 - (Date.now() % 1000) + 15
      timer = window.setTimeout(() => {
        if (cancelled) return
        setNow(Date.now())
        schedule()
      }, delay)
    }
    schedule()

    // Saat tab kembali aktif, segera sinkronkan agar tidak menampilkan angka basi.
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(Date.now())
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isValid, target])

  const totalMs = target === null ? 0 : Math.max(0, target - now)
  const isComplete = isValid && target !== null && totalMs <= 0

  const days = Math.floor(totalMs / 86_400_000)
  const hours = Math.floor((totalMs % 86_400_000) / 3_600_000)
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000)
  const seconds = Math.floor((totalMs % 60_000) / 1000)

  const parts = useMemo(
    () => [
      { key: 'days', label: 'Hari', value: days },
      { key: 'hours', label: 'Jam', value: hours },
      { key: 'minutes', label: 'Menit', value: minutes },
      { key: 'seconds', label: 'Detik', value: seconds },
    ],
    [days, hours, minutes, seconds],
  )

  return { isValid, isComplete, totalMs, days, hours, minutes, seconds, parts }
}

export default useCountdown
