import { useEffect, useState } from 'react'

/* ============================================================================
 *  QrCard — QR code undangan (dibuat di sisi klien, tanpa layanan pihak ketiga).
 *  Library `qrcode` dimuat secara dinamis sehingga hanya diunduh ketika tamu
 *  benar-benar membuka QR code — bundle utama tetap ringan.
 * ========================================================================== */
export default function QrCard({ url, size = 176, caption, className = '' }) {
  const [dataUrl, setDataUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) {
      setError('Tautan undangan belum tersedia.')
      return undefined
    }
    let active = true
    setError(null)
    setDataUrl(null)

    import('qrcode')
      .then((module) => {
        const QRCode = module.default ?? module
        return QRCode.toDataURL(url, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: size * 2,
          color: { dark: '#5B5044', light: '#FFFDF8' },
        })
      })
      .then((result) => {
        if (active) setDataUrl(result)
      })
      .catch(() => {
        if (active) setError('QR code tidak dapat dibuat. Anda tetap dapat menyalin tautan undangan.')
      })

    return () => {
      active = false
    }
  }, [url, size])

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="grid place-items-center overflow-hidden rounded-2xl border border-champagne/35 bg-[#fffdf8] p-2 shadow-soft"
        style={{ width: size, height: size }}
      >
        {error ? (
          <p className="px-3 text-center text-[11px] leading-relaxed text-cocoa-400">{error}</p>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="QR code menuju undangan pernikahan digital"
            width={size}
            height={size}
            className="h-full w-full rounded-xl"
          />
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-champagne/10" role="status" aria-label="Menyiapkan QR code" />
        )}
      </div>
      {caption ? <p className="max-w-[15rem] text-center font-serif text-xs italic text-cocoa-400">{caption}</p> : null}
    </div>
  )
}
