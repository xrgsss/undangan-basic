import { useCallback, useEffect, useRef, useState } from 'react'

/* ============================================================================
 *  useMusicPlayer — pemutar musik latar.
 *
 *  Aturan penting:
 *  • Audio element TIDAK dibuat sebelum interaksi pengguna (`enable()`),
 *    sehingga tidak ada autoplay yang diblokir browser dan tidak ada
 *    permintaan jaringan yang tidak perlu saat halaman pertama dibuka.
 *  • `play()` selalu dipanggil dari dalam event handler klik pengguna.
 *  • Semua kegagalan (file hilang, format tidak didukung, autoplay diblokir)
 *    ditangkap dan dilaporkan lewat `error` — tidak pernah membuat crash.
 * ========================================================================== */

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  ERROR: 'error',
}

export function useMusicPlayer({ src, volume = 0.45 } = {}) {
  const audioRef = useRef(null)
  const [status, setStatus] = useState(STATUS.IDLE)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const [volumeState, setVolumeState] = useState(volume)
  const [isMuted, setIsMuted] = useState(false)

  const hasSource = Boolean(src)

  /** Buat / ambil elemen audio beserta listener-nya. */
  const ensureAudio = useCallback(() => {
    if (!hasSource) {
      setStatus(STATUS.ERROR)
      setError('File musik belum dikonfigurasi.')
      return null
    }
    if (audioRef.current) return audioRef.current

    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = volumeState
    audio.muted = isMuted

    audio.addEventListener('loadstart', () => setStatus((s) => (s === STATUS.PLAYING ? s : STATUS.LOADING)))
    audio.addEventListener('canplay', () => {
      setStatus((s) => (s === STATUS.PLAYING ? s : STATUS.READY))
      setError(null)
    })
    audio.addEventListener('playing', () => {
      setStatus(STATUS.PLAYING)
      setIsPlaying(true)
      setError(null)
    })
    audio.addEventListener('pause', () => {
      setIsPlaying(false)
      setStatus((s) => (s === STATUS.ERROR ? s : STATUS.READY))
    })
    audio.addEventListener('error', () => {
      setStatus(STATUS.ERROR)
      setIsPlaying(false)
      setError('Musik tidak dapat diputar. Periksa berkas audio pada folder public/audio/.')
    })

    audio.src = src
    audioRef.current = audio
    return audio
  }, [hasSource, src, volumeState, isMuted])

  /** Aktifkan pemutar (dipanggil setelah pengguna menekan "Buka Undangan"). */
  const play = useCallback(async () => {
    const audio = ensureAudio()
    if (!audio) return false
    try {
      await audio.play()
      setIsPlaying(true)
      return true
    } catch (playError) {
      // NotAllowedError = autoplay diblokir; NotSupportedError = format bermasalah.
      setIsPlaying(false)
      setError(
        playError?.name === 'NotAllowedError'
          ? 'Browser memblokir pemutaran otomatis. Tekan tombol musik untuk memulai.'
          : 'Musik tidak dapat diputar saat ini.',
      )
      setStatus((s) => (s === STATUS.ERROR ? s : STATUS.READY))
      return false
    }
  }, [ensureAudio])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(async () => {
    if (!audioRef.current) return play()
    if (audioRef.current.paused) return play()
    pause()
    return false
  }, [pause, play])

  const setVolume = useCallback((next) => {
    const value = Math.min(Math.max(Number(next) || 0, 0), 1)
    setVolumeState(value)
    if (audioRef.current) audioRef.current.volume = value
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }, [])

  // Terapkan volume & mute setiap kali berubah (termasuk sebelum audio dibuat).
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumeState
      audioRef.current.muted = isMuted
    }
  }, [volumeState, isMuted])

  // Bersihkan resource saat komponen dilepas.
  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (!audio) return
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [])

  return {
    status,
    isPlaying,
    isReady: status === STATUS.READY || status === STATUS.PLAYING,
    isLoading: status === STATUS.LOADING,
    hasError: status === STATUS.ERROR,
    error,
    volume: volumeState,
    isMuted,
    play,
    pause,
    toggle,
    setVolume,
    toggleMute,
  }
}

export default useMusicPlayer
