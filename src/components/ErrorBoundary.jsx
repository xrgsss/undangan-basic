import { Component } from 'react'
import { weddingConfig } from '../data/weddingConfig'

/* ============================================================================
 *  ErrorBoundary — jaring pengaman agar kegagalan satu komponen tidak
 *  membuat halaman kosong. Menampilkan informasi acara penting sebagai
 *  fallback supaya tamu tetap mendapatkan informasi utama.
 * ========================================================================== */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[undangan] terjadi kesalahan pada antarmuka:', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const { couple, event, meta } = weddingConfig

    return (
      <div className="grid min-h-svh place-items-center px-5 py-12">
        <div className="paper-card w-full max-w-lg rounded-3xl px-6 py-8 text-center">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.34em] text-champagne-600">
            {meta.shortTitle}
          </p>
          <h1 className="mt-4 font-display text-2xl text-cocoa">Undangan tidak dapat ditampilkan sepenuhnya</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-cocoa-400">
            Terjadi kendala teknis saat memuat undangan. Namun informasi utama tetap kami sampaikan berikut.
          </p>

          <div className="mt-6 space-y-2 rounded-2xl border border-champagne/25 bg-white/60 px-4 py-4 text-left text-[13px] text-cocoa-600">
            <p className="font-display text-base text-cocoa">
              {couple.bride.nickname} &amp; {couple.groom.nickname}
            </p>
            <p>{event.dateLabel}</p>
            <p>
              {event.akad.title} · {event.akad.timeStart}–{event.akad.timeEnd} {event.akad.timezone}
            </p>
            <p>{event.akad.venue}</p>
            <p className="text-cocoa-400">{event.akad.address}</p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-champagne-600/60 bg-[linear-gradient(180deg,#c9a972_0%,#b9955b_52%,#9a7a46_100%)] px-6 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-ivory-50 shadow-gold"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    )
  }
}
